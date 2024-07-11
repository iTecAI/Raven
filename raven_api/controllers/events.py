from asyncio import TaskGroup, create_task
import asyncio
import json
from traceback import print_exc
from typing import Any, Literal, Type, get_args
from litestar import Controller, WebSocket, websocket
from litestar.status_codes import *
from litestar.channels import ChannelsPlugin
from pydantic import BaseModel
from ..common.models import Session, glob_match
from ..common.plugin import EVENTS


class AddSubscriptionsCommand(BaseModel):
    command: Literal["subscriptions.add"]
    paths: list[str]


class RemoveSubscriptionsCommand(BaseModel):
    command: Literal["subscriptions.remove"]
    paths: list[str]


COMMANDS = AddSubscriptionsCommand | RemoveSubscriptionsCommand


def command(obj: Any) -> COMMANDS | None:
    if isinstance(obj, dict) and "command" in obj.keys():
        constructors: dict[str, Type[COMMANDS]] = {
            get_args(arg.model_fields["command"].annotation)[0]: arg
            for arg in get_args(COMMANDS)
        }
        try:
            return constructors[obj["command"]](**command)
        except:
            return None
    return None


class EventController(Controller):
    path = "/events"

    async def handle_commands(self, socket: WebSocket, session: Session):
        async for message in socket.iter_json():
            obj = command(message)
            if obj:
                context = await session.get_event_context()
                match obj.command:
                    case "subscriptions.add":
                        for path in obj.paths:
                            if not path in context.subscriptions:
                                context.subscriptions.append(path)
                        await context.save()
                    case "subscriptions.remove":
                        context.subscriptions = [
                            i for i in context.subscriptions if not i in obj.paths
                        ]
                        await context.save()

    async def handle_messages(
        self, socket: WebSocket, session: Session, channels: ChannelsPlugin
    ):
        async with channels.start_subscription("events") as subscriber:
            async for message in subscriber.iter_events():
                socket.logger.info(message)
                try:
                    decoded = json.loads(message)
                    event = EVENTS(decoded)
                    socket.app.logger.info(event)
                    if event:
                        context = await session.get_event_context()
                        if len(glob_match(event.path, context.subscriptions)) > 0:
                            if event.scope == "global":
                                await socket.send_json(event.model_dump(mode="json"))
                            else:
                                if session.user_id:
                                    user = await session.user()
                                    if user.has_scope(*event.scope):
                                        await socket.send_json(
                                            event.model_dump(mode="json")
                                        )
                except json.JSONDecodeError:
                    print_exc()

    @websocket("/ws")
    async def event_handler(self, socket: WebSocket, channels: ChannelsPlugin) -> None:
        await socket.accept()
        if not "tokens.raven" in socket.cookies.keys():
            await socket.close(
                code=WS_1008_POLICY_VIOLATION, reason="Valid session token required"
            )
        session = await Session.get(socket.cookies.get("tokens.raven"))
        if not session:
            await socket.close(
                code=WS_1008_POLICY_VIOLATION, reason="Valid session token required"
            )

        async with TaskGroup() as group:
            group.create_task(self.handle_commands(socket, session))
            group.create_task(self.handle_messages(socket, session, channels))
        try:
            await socket.close()
        except:
            pass
