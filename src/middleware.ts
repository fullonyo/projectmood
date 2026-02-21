import { auth } from "@/auth"

export default auth((req) => {
    const isLoggedIn = !!req.auth
    const isAuthPage = req.nextUrl.pathname.startsWith("/auth")
    const isDashboardPage = req.nextUrl.pathname.startsWith("/dashboard")
    const isRootPage = req.nextUrl.pathname === "/"

    const isAdminPage = req.nextUrl.pathname.startsWith("/admin")

    if (isDashboardPage && !isLoggedIn) {
        return Response.redirect(new URL("/auth/login", req.nextUrl))
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
