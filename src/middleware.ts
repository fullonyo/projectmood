import NextAuth from "next-auth"
import authConfig from "./auth.config"

const { auth } = NextAuth(authConfig)

export default auth((req) => {
    const isLoggedIn = !!req.auth
    const pathname = req.nextUrl.pathname
    const isAuthPage = pathname.startsWith("/auth/") || pathname === "/auth"
    const isStudioPage = pathname.startsWith("/studio/") || pathname === "/studio"
    const isRootPage = pathname === "/"
    const isAdminPage = pathname.startsWith("/admin/") || pathname === "/admin"

    const isBanned = req.auth?.user?.isBanned
    const isBannedPage = pathname === "/banned"

    // Ban logic: If user is banned and not on the banned page, redirect them.
    if (isLoggedIn && isBanned && !isBannedPage) {
        return Response.redirect(new URL("/banned", req.nextUrl))
    }

    // If user is NOT banned but tries to access the banned page, redirect them to studio.
    if (isLoggedIn && !isBanned && isBannedPage) {
        return Response.redirect(new URL("/studio", req.nextUrl))
    }

    if (isStudioPage && !isLoggedIn) {
        return Response.redirect(new URL("/auth/login", req.nextUrl))
    }

    // Redirect logged-in users away from auth pages
    if (isAuthPage && isLoggedIn) {
        return Response.redirect(new URL("/studio", req.nextUrl))
    }

    // Role-based protection for the Admin Panel
    if (isAdminPage) {
        if (!isLoggedIn) {
            return Response.redirect(new URL("/auth/login", req.nextUrl))
        }
        const userRole = req.auth?.user?.role
        if (userRole !== "ADMIN") {
            return Response.redirect(new URL("/studio", req.nextUrl))
        }
    }

    if (isRootPage && isLoggedIn) {
        return Response.redirect(new URL("/studio", req.nextUrl))
    }
})

export const config = {
    // Exclui explicitamente OG image routes para crawlers como Discord/Twitter
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico|opengraph-image).*)"],
}
