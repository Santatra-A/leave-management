import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

// Define the protected routes
const protectedRoutes = ['/create-leave', '/leaves']

export default withAuth(
    function middleware(req) {
        const { pathname } = req.nextUrl

        // If the path is not in the protected routes, continue
        if (!protectedRoutes.some((path) => pathname.startsWith(path))) {
            return NextResponse.next()
        }

        // If the user is authenticated, continue
        const token = req.nextauth.token
        if (token) {
            return NextResponse.next()
        }

        // If not authenticated, redirect to /login
        const loginUrl = new URL('/login', req.url)
        return NextResponse.redirect(loginUrl)
    },
    {
        callbacks: {
            authorized: ({ token }) => !!token
        }
    }
)

// Specify the matcher to include only protected routes
export const config = {
    matcher: ['/create-leave/:path*', '/leaves/:path*']
}
