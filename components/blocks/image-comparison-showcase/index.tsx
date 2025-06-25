import ImageComparison from "@/components/blocks/image-comparison";
import { Section as SectionType } from "@/types/blocks/section";

// Extend SectionItem type to support image comparison
interface ImageComparisonItem {
  title?: string;
  description?: string;
  beforeImage: {
    src: string;
    alt?: string;
  };
  afterImage: {
    src: string;
    alt?: string;
  };
  beforeLabel?: string;
  afterLabel?: string;
  aspectRatio?: "16/9" | "4/3" | "1/1" | "3/2";
}

interface ImageComparisonSection extends Omit<SectionType, 'items'> {
  items?: ImageComparisonItem[];
  showLabels?: boolean;
  aspectRatio?: "16/9" | "4/3" | "1/1" | "3/2";
  columns?: 1 | 2 | 3;
}

export default function ImageComparisonShowcase({ 
  section 
}: { 
  section: ImageComparisonSection 
}) {
  if (section.disabled) {
    return null;
  }

  const {
    title,
    description,
    items = [],
    showLabels = true,
    aspectRatio = "16/9",
    columns = 2
  } = section;

  // Set grid styles based on column count
  const gridClass = {
    1: "grid-cols-1",
    2: "grid-cols-1 lg:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
  }[columns];

  return (
    <section className="container py-16">
      {/* Title and description */}
      {(title || description) && (
        <div className="mx-auto mb-12 text-center">
          {title && (
            <h2 className="mb-6 text-pretty text-3xl font-bold lg:text-4xl">
              {title}
            </h2>
          )}
          {description && (
            <p className="mb-4 max-w-3xl mx-auto text-muted-foreground lg:text-lg">
              {description}
            </p>
          )}
        </div>
      )}

      {/* Image comparison grid */}
      <div className={`grid gap-8 ${gridClass}`}>
        {items.map((item, index) => (
          <div key={index} className="space-y-4">
            {/* Image comparison component */}
            <ImageComparison
              beforeImage={item.beforeImage}
              afterImage={item.afterImage}
              beforeLabel={item.beforeLabel}
              afterLabel={item.afterLabel}
              aspectRatio={item.aspectRatio || aspectRatio}
              showLabels={showLabels}
              className="w-full"
            />
            
            {/* Title and description */}
            {(item.title || item.description) && (
              <div className="text-center space-y-2">
                {item.title && (
                  <h3 className="text-xl font-semibold">
                    {item.title}
                  </h3>
                )}
                {item.description && (
                  <p className="text-muted-foreground text-sm">
                    {item.description}
                  </p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Show example if no data */}
      {items.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-6">
            No comparison cases available. Here's an example:
          </p>
          <div className="max-w-2xl mx-auto">
            <ImageComparison
              beforeImage={{
                src: "/imgs/demo-before.jpg",
                alt: "Before processing example"
              }}
              afterImage={{
                src: "/imgs/demo-after.jpg",
                alt: "After processing example"
              }}
              beforeLabel="Original"
              afterLabel="AI Enhanced"
              aspectRatio="16/9"
              showLabels={true}
            />
            <div className="mt-4 text-center">
              <h3 className="text-xl font-semibold mb-2">AI Image Enhancement Effect</h3>
              <p className="text-muted-foreground text-sm">
                Drag the divider line to see the before and after comparison
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

// Export types for configuration use
export type { ImageComparisonItem, ImageComparisonSection };
