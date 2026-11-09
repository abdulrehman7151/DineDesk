
// import { NextResponse } from "next/server";
// import { getSafepayAuthToken } from "@/lib/payments/safepay";

// export async function GET() {
//     try {
//         const token = await getSafepayAuthToken();

//         return NextResponse.json({
//             success: true,
//             message: "Safepay authentication successful!",
//             tokenReceived: Boolean(token),
//         });

//     } catch (error) {
//         console.error("Safepay Error:", error);

//         return NextResponse.json(
//             {
//                 success: false,
//                 message:
//                     error instanceof Error
//                         ? error.message
//                         : "Something went wrong",
//             },
//             { status: 500 }
//         );
//     }
// }
