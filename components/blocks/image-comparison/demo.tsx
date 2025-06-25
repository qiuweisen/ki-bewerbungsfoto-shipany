"use client";

import ImageComparison from "./index";

// Demo component showing different usage patterns
export default function ImageComparisonDemo() {
  return (
    <div className="container py-16 space-y-16">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">Image Comparison Component Demo</h1>
        <p className="text-muted-foreground">
          Drag the divider line to see before and after AI processing effects
        </p>
      </div>

      {/* Basic example */}
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold">Basic Example</h2>
        <div className="max-w-4xl mx-auto">
          <ImageComparison
            beforeImage={{
              src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=450&fit=crop",
              alt: "Original landscape photo"
            }}
            afterImage={{
              src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=450&fit=crop&sat=2&con=1.2&bri=1.1",
              alt: "AI enhanced landscape photo"
            }}
            beforeLabel="Original"
            afterLabel="AI Enhanced"
            aspectRatio="16/9"
          />
        </div>
      </div>

      {/* Different aspect ratios example */}
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold">Different Aspect Ratios</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Square */}
          <div>
            <h3 className="text-lg font-medium mb-4">Square (1:1)</h3>
            <ImageComparison
              beforeImage={{
                src: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop",
                alt: "Original portrait"
              }}
              afterImage={{
                src: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&sat=1.5&con=1.1",
                alt: "AI beautified portrait"
              }}
              beforeLabel="Original"
              afterLabel="AI Beautified"
              aspectRatio="1/1"
            />
          </div>

          {/* 4:3 */}
          <div>
            <h3 className="text-lg font-medium mb-4">Traditional Ratio (4:3)</h3>
            <ImageComparison
              beforeImage={{
                src: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=600&h=450&fit=crop",
                alt: "Original architecture photo"
              }}
              afterImage={{
                src: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=600&h=450&fit=crop&sat=1.3&con=1.2&bri=1.05",
                alt: "AI optimized architecture photo"
              }}
              beforeLabel="Original"
              afterLabel="AI Optimized"
              aspectRatio="4/3"
            />
          </div>
        </div>
      </div>

      {/* Custom labels example */}
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold">Custom Labels</h2>
        <div className="max-w-4xl mx-auto">
          <ImageComparison
            beforeImage={{
              src: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=450&fit=crop",
              alt: "Original forest photo"
            }}
            afterImage={{
              src: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=450&fit=crop&sat=1.4&con=1.3&bri=1.1",
              alt: "HDR processed forest photo"
            }}
            beforeLabel="Standard Shot"
            afterLabel="HDR Processed"
            aspectRatio="16/9"
            initialPosition={30}
          />
        </div>
      </div>

      {/* No labels example */}
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold">No Labels Mode</h2>
        <div className="max-w-4xl mx-auto">
          <ImageComparison
            beforeImage={{
              src: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&h=450&fit=crop",
              alt: "Original beach photo"
            }}
            afterImage={{
              src: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&h=450&fit=crop&sat=1.6&con=1.4&bri=1.2",
              alt: "Color enhanced beach photo"
            }}
            showLabels={false}
            aspectRatio="16/9"
            initialPosition={70}
          />
          <p className="text-center text-sm text-muted-foreground mt-2">
            Left: Original Photo | Right: Color Enhanced
          </p>
        </div>
      </div>

      {/* Usage instructions */}
      <div className="bg-muted/50 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Usage Instructions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div>
            <h3 className="font-medium mb-2">Basic Features</h3>
            <ul className="space-y-1 text-muted-foreground">
              <li>• Mouse drag support for divider line</li>
              <li>• Touch device swipe support</li>
              <li>• Responsive design for all screen sizes</li>
              <li>• Customizable aspect ratios</li>
              <li>• Show/hide labels option</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium mb-2">Use Cases</h3>
            <ul className="space-y-1 text-muted-foreground">
              <li>• AI image processing effect showcase</li>
              <li>• Product feature comparison</li>
              <li>• Design work before/after comparison</li>
              <li>• Restoration effect demonstration</li>
              <li>• Filter effect comparison</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
