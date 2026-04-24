import { auth } from "@/auth"

export default auth((req) => {
    const isLoggedIn = !!req.auth
    const pathname = req.nextUrl.pathname
    const isAuthPage = pathname.startsWith("/auth/") || pathname === "/auth"
    const isDashboardPage = pathname.startsWith("/dashboard/") || pathname === "/dashboard"
    const isRootPage = pathname === "/"
    const isAdminPage = pathname.startsWith("/admin/") || pathname === "/admin"

    const isBanned = (req.auth?.user as any)?.isBanned
    const isBannedPage = pathname === "/banned"

    // Ban logic: If user is banned and not on the banned page, redirect them.
    if (isLoggedIn && isBanned && !isBannedPage) {
        return Response.redirect(new URL("/banned", req.nextUrl))
    }

    // If user is NOT banned but tries to access the banned page, redirect them to dashboard.
    if (isLoggedIn && !isBanned && isBannedPage) {
        return Response.redirect(new URL("/dashboard", req.nextUrl))
    }

    if (isDashboardPage && !isLoggedIn) {
        return Response.redirect(new URL("/auth/login", req.nextUrl))
    }

    // Redirect logged-in users away from auth pages
    if (isAuthPage && isLoggedIn) {
        return Response.redirect(new URL("/dashboard", req.nextUrl))
    }

    // Role-based protection for the Admin Panel
    if (isAdminPage) {
        if (!isLoggedIn) {
            return Response.redirect(new URL("/auth/login", req.nextUrl))
        }
        const userRole = (req.auth?.user as any)?.role
        if (userRole !== "ADMIN") {
            return Response.redirect(new URL("/dashboard", req.nextUrl))
        }
    }

    if (isRootPage && isLoggedIn) {
        return Response.redirect(new URL("/dashboard", req.nextUrl))
    }
})

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
