// src/auth/get-user.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    // If data is provided, return specific property (e.g., 'userId', 'email')
    if (data) {
      // Map 'userId' to 'id' for convenience
      if (data === 'userId') {
        return user?.id;
      }
      return user?.[data];
    }

    // Otherwise return the whole user object
    return user;
  },
);
