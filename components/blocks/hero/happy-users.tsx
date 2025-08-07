import { Avatar, AvatarImage } from "@/components/ui/avatar";

import { Star } from "lucide-react";

export default function HappyUsers() {
  // Unsplash professional headshot images with proper attribution
  const headshotImages = [
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1494790108755-2616b612b976?w=100&h=100&fit=crop&crop=face", 
    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&h=100&fit=crop&crop=face"
  ];

  return (
    <div className="mx-auto mt-8 flex w-fit flex-col items-center gap-2 sm:flex-row">
      <span className="mx-4 inline-flex items-center -space-x-2">
        {headshotImages.map((src, index) => (
          <Avatar className="size-12 border" key={index}>
            <AvatarImage
              src={src}
              alt={`Happy customer ${index + 1}`}
            />
          </Avatar>
        ))}
      </span>
      <div className="flex flex-col items-center gap-1 md:items-start">
        <div className="flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, index) => (
            <Star
              key={index}
              className="size-5 fill-yellow-400 text-yellow-400"
            />
          ))}
        </div>
                          <p className="text-left font-medium text-muted-foreground">
                    von 58.725+ zufriedenen Kunden
                  </p>
      </div>
    </div>
  );
}
