import { NextRequest, NextResponse } from "next/server";

import { AppError } from "../errors/AppError";
import { ZodError } from "zod";

// export type RouteContext = {
//     params?: any;
// };

// type RouteHandler = (
//     request: NextRequest,
//     context: RouteContext
// ) => Promise<NextResponse>;

// export function createRouteHandler(handler: RouteHandler) {
//     return async (
//         request: NextRequest,
//         context: RouteContext
//     ): Promise<NextResponse> => {
//         try {
//             return await handler(request, context);
//         } catch (error) {
//             if (error instanceof ZodError) {
//                 const message = error.issues[0]?.message || "Validation failed";
//                 return NextResponse.json(
//                     { message },
//                     { status: 422 }
//                 );
//             }
//             if (error instanceof AppError) {
//                 return NextResponse.json(
//                     {
//                         message: error.message,
//                     },
//                     {
//                         status: error.statusCode,
//                     }
//                 );
//             }

//             console.error(error);

//             return NextResponse.json(
//                 {
//                     message: "Internal Server Error",
//                 },
//                 {
//                     status: 500,
//                 }
//             );
//         }
//     };
// }

export type RouteContext<TParams = Record<string, string>> = {
    params?: Promise<TParams>;
};

type RouteHandler<TParams = Record<string, string>> = (
    request: NextRequest,
    context: RouteContext<TParams>
) => Promise<NextResponse>;

export function createRouteHandler<TParams = Record<string, string>>(
    handler: RouteHandler<TParams>
) {
    return async (
        request: NextRequest,
        context: RouteContext<TParams>
    ): Promise<NextResponse> => {
        try {
            return await handler(request, context);
        } catch (error) {
            if (error instanceof ZodError) {
                const message =
                    error.issues[0]?.message || "Validation failed";

                return NextResponse.json({ message }, { status: 422 });
            }

            if (error instanceof AppError) {
                return NextResponse.json(
                    { message: error.message },
                    { status: error.statusCode }
                );
            }

            console.error(error);

            return NextResponse.json(
                { message: "Internal Server Error" },
                { status: 500 }
            );
        }
    };
}