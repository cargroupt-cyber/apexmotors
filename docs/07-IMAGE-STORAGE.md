# APEX Automotive — Image Storage Guide

**Purpose:** Comprehensive comparison of image storage solutions with implementation guide.  
**Audience:** Developers, DevOps engineers  
**Version:** 1.0  
**Last Updated:** January 2025

---

## Table of Contents

1. [Requirements Analysis](#1-requirements-analysis)
2. [Cloudinary (RECOMMENDED)](#2-cloudinary-recommended)
3. [AWS S3 + CloudFront](#3-aws-s3--cloudfront)
4. [Supabase Storage](#4-supabase-storage)
5. [Comparison Matrix](#5-comparison-matrix)
6. [Cloudinary Implementation Guide](#6-cloudinary-implementation-guide)
7. [Frontend Integration](#7-frontend-integration)
8. [Best Practices](#8-best-practices)
9. [Migration Guide](#9-migration-guide)

---

## 1. Requirements Analysis

### Image Storage Requirements for APEX Automotive

| Requirement | Priority | Details |
|-------------|----------|---------|
| **Vehicle photos** | Critical | 10-20 images per vehicle, 100-500 vehicles = 1,000-10,000 images |
| **Blog images** | High | Featured images, inline content images |
| **Admin avatars** | Low | Staff profile photos |
| **Logo/branding** | Medium | Site logo, favicon, OG images |
| **Auto-optimization** | Critical | Automatic compression, format conversion |
| **Responsive images** | Critical | Multiple sizes for different viewports |
| **CDN delivery** | Critical | Global fast delivery |
| **Upload API** | Critical | Programmatic upload from admin panel |
| **Transformations** | High | Resize, crop, watermark, format conversion |
| **Backup** | High | Automatic backup of original images |
| **Cost efficiency** | High | Predictable pricing |
| **Easy setup** | Medium | Quick integration |

### Image Volume Estimates

| Image Type | Count | Avg Size | Total Storage | Monthly Growth |
|------------|-------|----------|---------------|----------------|
| Vehicle photos | 10,000 | 500KB | 5GB | +500MB |
| Blog images | 500 | 300KB | 150MB | +30MB |
| User avatars | 50 | 50KB | 2.5MB | +2MB |
| **Total** | | | **~5.2GB** | **~530MB/month** |

### Bandwidth Estimates

| Scenario | Requests/Month | Data Transfer |
|----------|---------------|---------------|
| 1,000 daily visitors, 5 pages each | 150,000 | ~50GB |
| 5,000 daily visitors | 750,000 | ~250GB |
| 10,000 daily visitors | 1,500,000 | ~500GB |

---

## 2. Cloudinary (RECOMMENDED)

Cloudinary is the recommended image storage solution for APEX Automotive due to its comprehensive feature set, developer-friendly API, and generous free tier.

### Why Cloudinary?

| Feature | Cloudinary | Benefit |
|---------|------------|---------|
| **Free tier** | 25GB storage + 25GB bandwidth/month | Sufficient for startup phase |
| **Auto-optimization** | Built-in | No manual compression needed |
| **Dynamic transformations** | URL-based | Change size/format via URL params |
| **CDN** | Multi-CDN (Akamai, Fastly, CloudFront) | Global fast delivery |
| **Upload API** | Simple REST + SDKs | Easy integration |
| **Image formats** | Auto WebP/AVIF | Modern formats for modern browsers |
| **Responsive breakpoints** | Automatic | Generate all sizes automatically |
| **Face detection** | Built-in | Smart cropping around faces |
| **Background removal** | Available | Premium feature for vehicle backgrounds |
| **Video support** | Full support | Future-proof for video walkthroughs |

### Pricing

| Plan | Storage | Bandwidth | Transformations | Price |
|------|---------|-----------|-----------------|-------|
| **Free** | 25GB | 25GB/month | 25K credits | Free |
| Plus | 225GB | 225GB/month | 225K credits | $25/month |
| Advanced | 500GB | 500GB/month | 500K credits | $89/month |

**The Free tier is sufficient for the first 6-12 months of operation.**

### Cloudinary Architecture

```
Admin Upload → Cloudinary API → Auto-optimization → CDN Edge Nodes → Visitor Browser
                                    ↓
                              Multiple formats:
                              - Original (backup)
                              - WebP (modern browsers)
                              - JPEG (fallback)
                              - Thumbnail (listings)
                              - Medium (detail page)
                              - Large (fullscreen)
```

---

## 3. AWS S3 + CloudFront

AWS S3 with CloudFront CDN is a powerful but more complex alternative.

### Pros

| Advantage | Description |
|-----------|-------------|
| **Full control** | Complete ownership of storage and configuration |
| **Highly scalable** | Handles virtually unlimited traffic |
| **Cost-effective at scale** | Cheaper per GB at high volumes |
| **Integration ecosystem** | Works seamlessly with other AWS services |
| **Fine-grained permissions** | IAM policies for access control |
| **Lifecycle policies** | Auto-archive old images to Glacier |

### Cons

| Disadvantage | Description |
|-------------|-------------|
| **Complex setup** | Requires IAM, S3, CloudFront, Route 53 configuration |
| **No built-in optimization** | Need Sharp.js or Lambda for image processing |
| **No transformation API** | Must implement resize/crop yourself |
| **Steep learning curve** | AWS complexity |
| **Cost unpredictability** | Egress fees can be surprising |

### Pricing

| Component | Cost |
|-----------|------|
| S3 Storage | $0.023/GB/month |
| S3 Requests (PUT) | $0.005/1,000 requests |
| S3 Requests (GET) | $0.0004/1,000 requests |
| CloudFront Data Transfer | $0.085/GB |
| CloudFront Requests | $0.0075/10,000 HTTPS requests |
| **Estimated monthly (50GB)** | **~$8-15/month** |

### When to Choose AWS

- You already have AWS infrastructure
- You need maximum control and customization
- You expect extremely high traffic (>1TB/month)
- You have DevOps expertise to manage the setup

---

## 4. Supabase Storage

Supabase Storage is a good middle-ground option, especially if you're already using Supabase for PostgreSQL.

### Pros

| Advantage | Description |
|-----------|-------------|
| **Simple API** | RESTful API, easy to use |
| **Good for PostgreSQL projects** | Same ecosystem as your database |
| **Row Level Security** | Database policies control access |
| **Free tier** | 1GB storage included |
| **CDN available** | Supabase CDN for fast delivery |
| **Transformations** | Basic resize via URL params |

### Cons

| Disadvantage | Description |
|-------------|-------------|
| **Limited transformations** | Basic resize only, no advanced features |
| **Smaller ecosystem** | Fewer integrations than Cloudinary/AWS |
| **Limited free tier** | 1GB may not be enough |
| **Less mature** | Newer product, fewer enterprise features |

### Pricing

| Plan | Storage | Bandwidth | Price |
|------|---------|-----------|-------|
| Free | 1GB | 2GB/month | Free |
| Pro | 100GB | 100GB/month | $25/month |
| Team | 1TB | 1TB/month | $599/month |

---

## 5. Comparison Matrix

| Criteria | Cloudinary | AWS S3+CloudFront | Supabase |
|----------|-----------|-------------------|----------|
| **Ease of setup** | Excellent | Complex | Good |
| **Free tier value** | Excellent (25GB) | Good (12mo free) | Fair (1GB) |
| **Auto-optimization** | Yes | No (manual) | Basic |
| **Dynamic transforms** | Excellent (URL-based) | No | Basic |
| **CDN performance** | Excellent | Excellent | Good |
| **Image formats** | WebP, AVIF, auto | Manual config | WebP |
| **Upload API** | Excellent | Good | Good |
| **Video support** | Yes | Via other services | Limited |
| **Backup** | Automatic | Manual config | Automatic |
| **Cost at scale** | Moderate | Low | Moderate |
| **Documentation** | Excellent | Good | Good |
| **TypeScript support** | Excellent | Good | Good |
| **Overall Score** | **9/10** | **7/10** | **6.5/10** |

**Recommendation: Cloudinary** for its optimal balance of features, ease of use, and pricing for the APEX Automotive use case.

---

## 6. Cloudinary Implementation Guide

### Step 1: Create Cloudinary Account

```
1. Go to https://cloudinary.com/users/register/free
2. Sign up with your email or GitHub account
3. Choose a cloud name (e.g., "apex-automotive")
4. Complete the onboarding wizard
5. Note down your credentials:
   - Cloud Name: your_cloud_name
   - API Key: your_api_key
   - API Secret: your_api_secret
   - Environment Variable: CLOUDINARY_URL=cloudinary://API_KEY:API_SECRET@CLOUD_NAME
```

### Step 2: Install Cloudinary SDK

```bash
# Backend (Node.js)
npm install cloudinary

# Frontend (React)
npm install @cloudinary/react @cloudinary/url-gen

# TypeScript types
npm install -D @types/cloudinary
```

### Step 3: Configure Cloudinary

```typescript
// server/config/cloudinary.ts
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true, // Use HTTPS
});

export default cloudinary;
```

```env
# .env
CLOUDINARY_CLOUD_NAME=apex-automotive
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=your_secret_key_here
CLOUDINARY_FOLDER=apex_automotive
```

### Step 4: Create Upload Endpoint

```typescript
// server/routes/upload.ts
import { Router } from "express";
import multer from "multer";
import cloudinary from "../config/cloudinary";
import { requireAuth } from "../middleware/auth";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// Upload single image
router.post(
  "/vehicle-image",
  requireAuth,
  upload.single("image"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No image provided" });
      }

      const result = await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            {
              folder: `${process.env.CLOUDINARY_FOLDER}/vehicles`,
              resource_type: "image",
              transformation: [
                { quality: "auto:good" },
                { fetch_format: "auto" },
              ],
              metadata: {
                uploaded_by: req.auth.userId,
                vehicle_id: req.body.vehicleId || "unassigned",
              },
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          )
          .end(req.file.buffer);
      });

      res.json({
        success: true,
        image: {
          publicId: result.public_id,
          url: result.secure_url,
          width: result.width,
          height: result.height,
          format: result.format,
          size: result.bytes,
        },
      });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ error: "Failed to upload image" });
    }
  }
);

// Upload multiple images
router.post(
  "/vehicle-images",
  requireAuth,
  upload.array("images", 20), // Max 20 images
  async (req, res) => {
    try {
      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        return res.status(400).json({ error: "No images provided" });
      }

      const uploadPromises = files.map((file, index) => {
        return new Promise((resolve, reject) => {
          cloudinary.uploader
            .upload_stream(
              {
                folder: `${process.env.CLOUDINARY_FOLDER}/vehicles`,
                resource_type: "image",
                transformation: [
                  { quality: "auto:good" },
                  { fetch_format: "auto" },
                ],
                eager: [
                  // Pre-generate common sizes
                  { width: 400, height: 300, crop: "fill", quality: "auto" },
                  { width: 800, height: 600, crop: "fill", quality: "auto" },
                  { width: 1200, height: 800, crop: "fill", quality: "auto" },
                ],
              },
              (error, result) => {
                if (error) reject(error);
                else resolve({
                  publicId: result.public_id,
                  url: result.secure_url,
                  thumbnailUrl: result.eager?.[0]?.secure_url,
                  mediumUrl: result.eager?.[1]?.secure_url,
                  largeUrl: result.eager?.[2]?.secure_url,
                  width: result.width,
                  height: result.height,
                  format: result.format,
                  size: result.bytes,
                  sortOrder: index,
                  isPrimary: index === 0,
                });
              }
            )
            .end(file.buffer);
        });
      });

      const images = await Promise.all(uploadPromises);

      res.json({
        success: true,
        images,
      });
    } catch (error) {
      console.error("Bulk upload error:", error);
      res.status(500).json({ error: "Failed to upload images" });
    }
  }
);

// Delete image
router.delete("/:publicId", requireAuth, async (req, res) => {
  try {
    const { publicId } = req.params;
    await cloudinary.uploader.destroy(publicId);
    res.json({ success: true, message: "Image deleted" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete image" });
  }
});

export default router;
```

### Step 5: Set Up Auto-Optimization

Cloudinary provides automatic optimization through URL parameters:

```typescript
// utils/cloudinary.ts
import { CloudinaryImage } from "@cloudinary/url-gen";
import { fill, scale } from "@cloudinary/url-gen/actions/resize";
import { auto, autoBest } from "@cloudinary/url-gen/qualifiers/quality";
import { auto as autoFormat } from "@cloudinary/url-gen/qualifiers/format";

// Generate optimized image URL
export function getOptimizedUrl(
  publicId: string,
  options: {
    width?: number;
    height?: number;
    crop?: "fill" | "scale" | "fit" | "thumb";
    quality?: "auto" | "auto:best" | "auto:eco" | "auto:low";
    format?: "auto" | "webp" | "avif" | "jpg";
  } = {}
): string {
  const {
    width = 800,
    height,
    crop = "fill",
    quality = "auto:good",
    format = "auto",
  } = options;

  // Build transformation string
  const transforms: string[] = [
    `c_${crop}`,
    `w_${width}`,
    ...(height ? [`h_${height}`] : []),
    `q_${quality}`,
    `f_${format}`,
    "dpr_auto", // Automatic device pixel ratio
  ];

  return `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/${transforms.join(",")}/${publicId}`;
}

// Usage examples:
// Thumbnail (listing page)
getOptimizedUrl("apex/vehicles/bmw-3-series-1", {
  width: 400,
  height: 300,
  crop: "fill",
});
// → https://res.cloudinary.com/.../c_fill,w_400,h_300,q_auto:good,f_auto,dpr_auto/apex/vehicles/bmw-3-series-1

// Detail page hero
getOptimizedUrl("apex/vehicles/bmw-3-series-1", {
  width: 1200,
  height: 800,
  crop: "fill",
  quality: "auto:best",
});

// Fullscreen gallery
getOptimizedUrl("apex/vehicles/bmw-3-series-1", {
  width: 1920,
  crop: "scale",
});
```

### Step 6: Configure CDN

Cloudinary automatically uses a multi-CDN setup. For additional optimization:

```typescript
// Add custom domain (paid feature) for branded URLs
// Dashboard → Settings → Custom Domain
// Example: images.apexautomotive.co.uk

// Use signed URLs for sensitive images (paid feature)
import { v2 as cloudinary } from "cloudinary";

export function getSignedUrl(publicId: string, expiresIn: number = 3600): string {
  return cloudinary.utils.private_download_url(publicId, "jpg", {
    expires_at: Math.floor(Date.now() / 1000) + expiresIn,
  });
}
```

---

## 7. Frontend Integration

### Upload Component

```typescript
// components/ImageUpload.tsx
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Upload, X, Star, GripVertical } from "lucide-react";

interface UploadImage {
  id: string;
  file?: File;
  preview?: string;
  url?: string;
  publicId?: string;
  isPrimary: boolean;
  isUploading: boolean;
  progress: number;
}

export function ImageUpload({
  value,
  onChange,
  maxImages = 20,
}: {
  value: UploadImage[];
  onChange: (images: UploadImage[]) => void;
  maxImages?: number;
}) {
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (value.length + acceptedFiles.length > maxImages) {
        toast.error(`Maximum ${maxImages} images allowed`);
        return;
      }

      // Create preview images
      const newImages: UploadImage[] = acceptedFiles.map((file, index) => ({
        id: `temp-${Date.now()}-${index}`,
        file,
        preview: URL.createObjectURL(file),
        isPrimary: value.length === 0 && index === 0,
        isUploading: true,
        progress: 0,
      }));

      onChange([...value, ...newImages]);
      setIsUploading(true);

      // Upload each image
      for (let i = 0; i < newImages.length; i++) {
        const formData = new FormData();
        formData.append("image", newImages[i].file!);

        try {
          const response = await fetch("/api/upload/vehicle-image", {
            method: "POST",
            body: formData,
            credentials: "include",
          });

          if (!response.ok) throw new Error("Upload failed");

          const data = await response.json();

          // Update image with uploaded URL
          onChange((prev) =>
            prev.map((img) =>
              img.id === newImages[i].id
                ? {
                    ...img,
                    url: data.image.url,
                    publicId: data.image.publicId,
                    isUploading: false,
                    progress: 100,
                  }
                : img
            )
          );
        } catch {
          toast.error(`Failed to upload image ${i + 1}`);
          onChange((prev) => prev.filter((img) => img.id !== newImages[i].id));
        }
      }

      setIsUploading(false);
    },
    [value, maxImages]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".webp"],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    disabled: isUploading,
  });

  const removeImage = (id: string) => {
    onChange(value.filter((img) => img.id !== id));
  };

  const setPrimary = (id: string) => {
    onChange(
      value.map((img) => ({
        ...img,
        isPrimary: img.id === id,
      }))
    );
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = value.findIndex((img) => img.id === active.id);
      const newIndex = value.findIndex((img) => img.id === over.id);
      onChange(arrayMove(value, oldIndex, newIndex));
    }
  };

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      {value.length < maxImages && (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
            isDragActive
              ? "border-blue-500 bg-blue-50"
              : "border-gray-300 hover:border-gray-400"
          } ${isUploading ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <input {...getInputProps()} />
          <Upload className="mx-auto h-10 w-10 text-gray-400 mb-3" />
          <p className="text-sm text-gray-600">
            {isDragActive
              ? "Drop images here..."
              : `Drag & drop images, or click to browse (${value.length}/${maxImages})`}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            JPG, PNG, WebP up to 10MB each
          </p>
        </div>
      )}

      {/* Image grid */}
      {value.length > 0 && (
        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext
            items={value.map((i) => i.id)}
            strategy={rectSortingStrategy}
          >
            <div className="grid grid-cols-3 gap-4 md:grid-cols-4 lg:grid-cols-5">
              {value.map((image) => (
                <SortableImageCard
                  key={image.id}
                  image={image}
                  onRemove={() => removeImage(image.id)}
                  onSetPrimary={() => setPrimary(image.id)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}

// Sortable image card
function SortableImageCard({
  image,
  onRemove,
  onSetPrimary,
}: {
  image: UploadImage;
  onRemove: () => void;
  onSetPrimary: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: image.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative aspect-square rounded-lg overflow-hidden border-2 ${
        image.isPrimary ? "border-yellow-400" : "border-gray-200"
      } ${isDragging ? "shadow-xl" : ""}`}
    >
      <img
        src={image.preview || image.url}
        alt="Vehicle"
        className="w-full h-full object-cover"
      />

      {/* Uploading overlay */}
      {image.isUploading && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <div className="w-16 h-1 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all"
              style={{ width: `${image.progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="absolute top-1 right-1 flex gap-1">
        <button
          onClick={onSetPrimary}
          className={`p-1 rounded-full ${
            image.isPrimary
              ? "bg-yellow-400 text-yellow-900"
              : "bg-black/50 text-white hover:bg-black/70"
          }`}
          title={image.isPrimary ? "Primary image" : "Set as primary"}
        >
          <Star className="h-3 w-3" />
        </button>
        <button
          onClick={onRemove}
          className="p-1 rounded-full bg-black/50 text-white hover:bg-red-500"
          title="Remove image"
        >
          <X className="h-3 w-3" />
        </button>
      </div>

      {/* Drag handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute top-1 left-1 p-1 rounded-full bg-black/50 text-white cursor-grab"
      >
        <GripVertical className="h-3 w-3" />
      </div>

      {/* Primary badge */}
      {image.isPrimary && (
        <div className="absolute bottom-0 left-0 right-0 bg-yellow-400 text-yellow-900 text-xs text-center py-0.5 font-medium">
          Primary
        </div>
      )}
    </div>
  );
}
```

### Optimized Image Component

```typescript
// components/OptimizedImage.tsx
import { useState } from "react";
import { getOptimizedUrl } from "@/utils/cloudinary";

interface OptimizedImageProps {
  publicId: string;
  alt: string;
  width?: number;
  height?: number;
  crop?: "fill" | "scale" | "fit";
  quality?: "auto" | "auto:best" | "auto:eco";
  className?: string;
  priority?: boolean;
}

export function OptimizedImage({
  publicId,
  alt,
  width = 800,
  height,
  crop = "fill",
  quality = "auto:good",
  className = "",
  priority = false,
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  // Generate src and srcset for responsive images
  const src = getOptimizedUrl(publicId, { width, height, crop, quality });

  const srcSet = [
    `${getOptimizedUrl(publicId, { width: Math.round(width * 0.5), height: height ? Math.round(height * 0.5) : undefined, crop, quality })} ${Math.round(width * 0.5)}w`,
    `${getOptimizedUrl(publicId, { width, height, crop, quality })} ${width}w`,
    `${getOptimizedUrl(publicId, { width: width * 2, height: height ? height * 2 : undefined, crop, quality })} ${width * 2}w`,
  ].join(", ");

  // Generate tiny placeholder for blur-up effect
  const placeholderUrl = getOptimizedUrl(publicId, {
    width: 20,
    height: height ? Math.round((height / width) * 20) : 20,
    crop,
    quality: "auto:low",
  });

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Placeholder blur */}
      {!isLoaded && (
        <img
          src={placeholderUrl}
          alt=""
          className="absolute inset-0 w-full h-full object-cover blur-xl scale-110"
          aria-hidden="true"
        />
      )}

      {/* Main image */}
      <img
        src={src}
        srcSet={srcSet}
        sizes={`(max-width: 768px) 100vw, ${width}px`}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        onLoad={() => setIsLoaded(true)}
        className={`w-full h-full object-cover transition-opacity duration-500 ${
          isLoaded ? "opacity-100" : "opacity-0"
        }`}
      />
    </div>
  );
}

// Usage:
// <OptimizedImage
//   publicId="apex/vehicles/bmw-3-series-1"
//   alt="2022 BMW 3 Series M Sport"
//   width={800}
//   height={600}
//   priority={true} // For above-the-fold images
// />
```

---

## 8. Best Practices

### Image Optimization Checklist

- [ ] Upload original high-resolution images (minimum 1920px wide)
- [ ] Let Cloudinary handle compression and format conversion
- [ ] Use `q_auto` for automatic quality optimization
- [ ] Use `f_auto` for automatic format selection (WebP/AVIF)
- [ ] Use `dpr_auto` for automatic pixel density
- [ ] Generate eager transformations for common sizes
- [ ] Use responsive images with `srcset`
- [ ] Implement blur-up loading effect
- [ ] Set appropriate cache headers
- [ ] Monitor bandwidth usage monthly

### Naming Convention

```
apex/vehicles/{vehicle-id}/{timestamp}-{sequence}.jpg
apex/blog/{post-slug}/featured.jpg
apex/blog/{post-slug}/inline-{sequence}.jpg
apex/users/{user-id}/avatar.jpg
apex/branding/logo.png
apex/branding/og-default.jpg
```

### Security

```typescript
// Restrict upload types
const ALLOWED_FORMATS = ["jpg", "jpeg", "png", "webp"];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// Validate before upload
function validateImage(file: File): boolean {
  const ext = file.name.split(".").pop()?.toLowerCase();
  if (!ext || !ALLOWED_FORMATS.includes(ext)) {
    throw new Error("Invalid file format. Only JPG, PNG, and WebP allowed.");
  }
  if (file.size > MAX_FILE_SIZE) {
    throw new Error("File too large. Maximum 10MB.");
  }
  return true;
}

// Use signed uploads for additional security (recommended for production)
// This prevents unauthorized uploads
```

---

## 9. Migration Guide

### Migrating from Local Storage to Cloudinary

```typescript
// scripts/migrate-images.ts
import { readdir, readFile } from "fs/promises";
import { join } from "path";
import { v2 as cloudinary } from "cloudinary";
import { db } from "../server/db";
import { vehicleImages } from "../server/db/schema";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function migrateImages() {
  const vehiclesDir = "./public/images/vehicles";
  const vehicleFolders = await readdir(vehiclesDir);

  for (const folder of vehicleFolders) {
    const folderPath = join(vehiclesDir, folder);
    const files = await readdir(folderPath);

    for (const file of files) {
      const filePath = join(folderPath, file);
      const buffer = await readFile(filePath);

      try {
        const result = await new Promise((resolve, reject) => {
          cloudinary.uploader
            .upload_stream(
              {
                folder: `${process.env.CLOUDINARY_FOLDER}/vehicles/${folder}`,
                transformation: [
                  { quality: "auto:good" },
                  { fetch_format: "auto" },
                ],
              },
              (error, result) => {
                if (error) reject(error);
                else resolve(result);
              }
            )
            .end(buffer);
        });

        // Update database with new URL
        await db.insert(vehicleImages).values({
          vehicleId: folder, // Assuming folder name is vehicle ID
          imageUrl: result.secure_url,
          publicId: result.public_id,
          isPrimary: file.includes("primary") || file.includes("01"),
          sortOrder: parseInt(file.match(/\d+/)?.[0] || "0"),
        });

        console.log(`Migrated: ${file} → ${result.public_id}`);
      } catch (error) {
        console.error(`Failed to migrate ${file}:`, error);
      }
    }
  }

  console.log("Migration complete!");
}

migrateImages().catch(console.error);
```

---

**Document Version:** 1.0  
**Last Updated:** January 2025
