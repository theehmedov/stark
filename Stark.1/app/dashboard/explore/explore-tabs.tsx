"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Rocket, Building2 } from "lucide-react"

interface ExploreTabsClientProps {
  startupCards: React.ReactNode
  itCompanyCards: React.ReactNode
  startupCount: number
  itCompanyCount: number
}

export default function ExploreTabsClient({
  startupCards,
  itCompanyCards,
  startupCount,
  itCompanyCount,
}: ExploreTabsClientProps) {
  return (
    <Tabs defaultValue="startups" className="w-full">
      <TabsList className="h-11 p-1 bg-white/60 backdrop-blur-sm border border-slate-200/60 rounded-xl shadow-sm mb-6">
        <TabsTrigger
          value="startups"
          className="rounded-lg px-5 py-2 text-sm font-semibold data-[state=active]:bg-navy-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all"
        >
          <Rocket className="w-4 h-4 mr-2" />
          Startups
          <span className="ml-2 text-xs opacity-70">({startupCount})</span>
        </TabsTrigger>
        <TabsTrigger
          value="it-companies"
          className="rounded-lg px-5 py-2 text-sm font-semibold data-[state=active]:bg-gold-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all"
        >
          <Building2 className="w-4 h-4 mr-2" />
          IT Companies
          <span className="ml-2 text-xs opacity-70">({itCompanyCount})</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="startups" className="mt-0">
        {startupCards}
      </TabsContent>

      <TabsContent value="it-companies" className="mt-0">
        {itCompanyCards}
      </TabsContent>
    </Tabs>
  )
}
