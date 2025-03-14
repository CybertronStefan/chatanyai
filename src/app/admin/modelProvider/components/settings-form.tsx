"use client"

import type React from "react"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"

interface SettingsFormProps {
  modelId: string
}

export function SettingsForm({ modelId }: SettingsFormProps) {
  const [temperature, setTemperature] = useState("0.7")
  const [maxTokens, setMaxTokens] = useState("2048")
  const [streaming, setStreaming] = useState(false)
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Here you would typically save the settings to your backend or local storage
    console.log("Settings saved:", { modelId, temperature, maxTokens, streaming })
    toast({
      title: "Settings saved",
      description: `Your settings for ${modelId} have been updated successfully.`,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="temperature">Temperature</Label>
        <Input
          id="temperature"
          type="number"
          value={temperature}
          onChange={(e) => setTemperature(e.target.value)}
          min={0}
          max={2}
          step={0.1}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="max-tokens">Max Tokens</Label>
        <Input id="max-tokens" type="number" value={maxTokens} onChange={(e) => setMaxTokens(e.target.value)} min={1} />
      </div>
      {modelId === "custom" && (
        <div className="space-y-2">
          <Label htmlFor="custom-model-name">Custom Model Name</Label>
          <Input id="custom-model-name" placeholder="Enter custom model name" />
        </div>
      )}
      <div className="flex items-center space-x-2">
        <Switch id="streaming" checked={streaming} onCheckedChange={setStreaming} />
        <Label htmlFor="streaming">Enable streaming</Label>
      </div>
      <Button type="submit">Save Settings</Button>
    </form>
  )
}

