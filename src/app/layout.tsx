import { ClerkProvider } from '@clerk/nextjs'
import './globals.css'

export default function RootLayout({
 children,
}: {
 children: React.ReactNode
}) {
 // Graceful fallback so the UI renders visually without active API keys.
 const hasKeys = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

 return (
  <html lang="en">
   <body>
    {hasKeys ? (
     <ClerkProvider>{children}</ClerkProvider>
    ) : (
     children
    )}
   </body>
  </html>
 )
}
