'use client'

import { useState } from 'react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2 } from "lucide-react"

const PERPLEXITY_API_KEY = process.env.NEXT_PUBLIC_PERPLEXITY_API_KEY

interface ToyInfo {
  description: string
  priceComparison: string
  developmentalBenefits: string
  reviews: string
}

export default function ToySearch() {
  const [toyQuery, setToyQuery] = useState('')
  const [toyInfo, setToyInfo] = useState<ToyInfo | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const fetchToyInfo = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'mixtral-8x7b-instruct',
          messages: [
            { role: 'system', content: 'You are a helpful assistant that provides information about toys.' },
            { role: 'user', content: `Provide a detailed description, price comparison from multiple sites, developmental benefits, and reviews for the toy: ${toyQuery}. Format the response as JSON with keys: description, priceComparison, developmentalBenefits, and reviews.` }
          ]
        })
      })

      if (!response.ok) {
        throw new Error('Failed to fetch toy information')
      }

      const data = await response.json()
      const parsedInfo = JSON.parse(data.choices[0].message.content)
      setToyInfo(parsedInfo)
    } catch (error) {
      console.error('Error fetching toy information:', error)
      // In a real application, you would handle this error more gracefully
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (toyQuery) {
      fetchToyInfo()
    }
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Toy Search and Comparison</h1>
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="flex gap-2">
          <Input
            type="text"
            value={toyQuery}
            onChange={(e) => setToyQuery(e.target.value)}
            placeholder="Enter toy name or description"
            className="flex-grow"
          />
          <Button type="submit" disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Search'}
          </Button>
        </div>
      </form>

      {toyInfo && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>{toyQuery}</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="description">
              <TabsList>
                <TabsTrigger value="description">Description</TabsTrigger>
                <TabsTrigger value="price">Price Comparison</TabsTrigger>
                <TabsTrigger value="benefits">Developmental Benefits</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
              </TabsList>
              <TabsContent value="description">
                <p>{toyInfo.description}</p>
              </TabsContent>
              <TabsContent value="price">
                <p>{toyInfo.priceComparison}</p>
              </TabsContent>
              <TabsContent value="benefits">
                <p>{toyInfo.developmentalBenefits}</p>
              </TabsContent>
              <TabsContent value="reviews">
                <p>{toyInfo.reviews}</p>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  )
}