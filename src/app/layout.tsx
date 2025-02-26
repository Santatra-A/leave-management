import type { Metadata } from 'next'
import localFont from 'next/font/local'
import './globals.css'
import type { PropsWithChildren } from 'react'

const geistSans = localFont({
    src: './fonts/GeistVF.woff',
    variable: '--font-geist-sans',
    weight: '100 900'
})
const geistMono = localFont({
    src: './fonts/GeistMonoVF.woff',
    variable: '--font-geist-mono',
    weight: '100 900'
})

export const metadata: Metadata = {
    title: 'Reporting System',
    description: 'Reporting System by Next.js'
}

interface RootLayoutProps extends PropsWithChildren {}

export default function RootLayout({ children }: Readonly<RootLayoutProps>) {
    return (
        <html lang="en">
            <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>{children}</body>
        </html>
    )
}
