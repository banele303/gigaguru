'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UploadDropzone } from '@/app/lib/uplaodthing';
import Image from 'next/image';

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

    if (!formData.title) {
      toast.error('Please enter a title');
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
          title: formData.title,
          imageString: imageUrl,
          description: formData.description || '',
          link: formData.link || '',
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
      toast.error(error instanceof Error ? error.message : 'Failed to create banner');
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
              {imageUrl ? (
                <div className="relative">
                  <Image
                    src={imageUrl}
                    alt="Banner preview"
                    width={1920}
                    height={600}
                    className="w-full h-[300px] object-cover rounded-lg"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => setImageUrl('')}
                    disabled={isLoading}
                  >
                    Remove
                  </Button>
                </div>
              ) : (
                <UploadDropzone
                  endpoint="bannerImageRoute"
                  onClientUploadComplete={(res) => {
                    setImageUrl(res[0].url);
                    toast.success('Image uploaded successfully');
                  }}
                  onUploadError={(error) => {
                    toast.error('Failed to upload image');
                    console.error('Upload error:', error);
                  }}
                  config={{
                    mode: "auto"
                  }}
                />
              )}
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
                disabled={isLoading}
                placeholder="Enter banner description (optional)"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="link">Link</Label>
              <Input
                id="link"
                name="link"
                value={formData.link}
                onChange={handleChange}
                disabled={isLoading}
                placeholder="Enter banner link (optional)"
              />
            </div>

            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create Banner'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 