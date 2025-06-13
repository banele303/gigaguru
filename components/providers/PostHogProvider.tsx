"use client"

import posthog from "posthog-js"
import { PostHogProvider as Provider } from "posthog-js/react"
import { usePathname, useSearchParams } from "next/navigation"
import { useEffect } from "react"

if (typeof window !== "undefined") {
  posthog.init("phc_W4a97m0DvdBo8XTIkzQ9hPK5fD5XaoBQv7U8y7bnxfI98Pg", {
    api_host: "https://us.i.posthog.com",
    loaded: (posthog) => {
      if (process.env.NODE_ENV === "development") posthog.debug()
    },
    capture_pageview: false,
    autocapture: true,
    capture_pageleave: "if_capture_pageview",
    persistence: "localStorage+cookie",
    disable_session_recording: false,
    disable_persistence: false,
    disable_web_experiments: true,
    disable_surveys: false
  })
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (pathname) {
      let url = window.origin + pathname
      if (searchParams?.toString()) {
        url = url + `?${searchParams.toString()}`
      }
      posthog.capture("$pageview", {
        $current_url: url,
      })
    }
  }, [pathname, searchParams])

  return <Provider client={posthog}>{children}</Provider>
} 