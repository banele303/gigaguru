'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ImageUpload } from '@/components/ui/image-upload';

export default function CreateBannerPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    link: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!imageUrl) {
      toast.error('Please upload a banner image');
      return;
    }

    if (!formData.title || !formData.description || !formData.link) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch('/api/banners', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          imageUrl,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create banner');
      }

      toast.success('Banner created successfully');
      router.push('/dashboard/banners');
      router.refresh();
    } catch (error) {
      console.error('Error creating banner:', error);
      toast.error(error instanceof Error ? error.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Create New Banner</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="image">Banner Image</Label>
              <ImageUpload
                value={imageUrl}
                onChange={(url) => {
                  console.log('Image URL updated:', url);
                  setImageUrl(url);
                }}
                onRemove={() => setImageUrl('')}
                endpoint="bannerImageRoute"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                disabled={isLoading}
                placeholder="Enter banner title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                disabled={isLoading}
                placeholder="Enter banner description"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="link">Link URL</Label>
              <Input
                id="link"
                name="link"
                type="url"
                value={formData.link}
                onChange={handleChange}
                required
                disabled={isLoading}
                placeholder="Enter banner link URL"
              />
            </div>

            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? 'Creating...' : 'Create Banner'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 