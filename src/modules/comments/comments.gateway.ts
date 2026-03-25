import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { CommentWsEvents } from './comments.events';
@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class CommentsSocketGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log(`Клиент подключился: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Клиент отключился: ${client.id}`);
  }

  sendNewComment(comment: any) {
    this.server.emit(CommentWsEvents.CREATED, comment);
  }

  sendFileReady(fileId: number, isLoaded: boolean) {
    this.server.emit(CommentWsEvents.FILE_READY, {
      fileId,
      isLoaded,
    });
  }

  sendCommentDelete(comment: any) {
    this.server.emit(CommentWsEvents.DELETED, comment);
  }
}
