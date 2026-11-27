// Removed: SafePay was removed from DineDesk — Paddle is the only payment
// provider now. This route is kept as a stub (returning 410 Gone) because
// the deploy tool cannot delete files. Nothing in the app calls it.
export async function POST() {
    return Response.json(
        { error: "SafePay is no longer supported." },
        { status: 410 }
    );
}
