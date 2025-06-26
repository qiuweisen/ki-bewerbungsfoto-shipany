import { TableColumn } from "@/types/blocks/table";
import TableSlot from "@/components/dashboard/slots/table";
import { Table as TableSlotType } from "@/types/slots/table";
import { getAllAIGenerationOrders } from "@/models/ai-generation-record";
import moment from "moment";
import Image from "next/image";
import AdminPhotosClient from "./client";

export default async function AdminPhotosPage() {
  // 获取所有图片生成记录
  const allOrders = await getAllAIGenerationOrders('image', 1, 200);

  // 统计数据
  const stats = {
    total: allOrders.length,
    success: allOrders.filter(photo => photo.status === 'success').length,
    failed: allOrders.filter(photo => photo.status === 'failed').length,
    processing: allOrders.filter(photo => photo.status === 'processing').length,
  };

  const successPhotos = allOrders.filter(photo =>
    photo.status === 'success' &&
    photo.result_urls &&
    photo.result_urls.length > 0
  );

  const columns: TableColumn[] = [
    { 
      name: "id", 
      title: "ID",
      callback: (row) => `#${row.id}`
    },
    {
      name: "result_urls",
      title: "Preview",
      callback: (row) => {
        const firstImageUrl = row.result_urls?.[0];
        if (!firstImageUrl) return <span className="text-muted-foreground">No image</span>;
        
        return (
          <div className="relative w-16 h-16">
            <Image
              src={firstImageUrl}
              alt="Generated image"
              fill
              className="object-cover rounded-md"
            />
          </div>
        );
      },
    },
    {
      name: "prompt",
      title: "Prompt",
      callback: (row) => (
        <div className="max-w-xs">
          <p className="text-sm line-clamp-2" title={row.prompt}>
            {row.prompt}
          </p>
        </div>
      ),
    },
    {
      name: "user_uuid",
      title: "User",
      callback: (row) => (
        <span className="text-xs font-mono bg-muted px-2 py-1 rounded">
          {row.user_uuid?.slice(0, 8)}...
        </span>
      ),
    },
    {
      name: "provider",
      title: "Provider",
      callback: (row) => (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {row.provider}
        </span>
      ),
    },
    {
      name: "model",
      title: "Model",
      callback: (row) => (
        <span className="text-sm text-muted-foreground">
          {row.model}
        </span>
      ),
    },
    {
      name: "credits_cost",
      title: "Credits",
      callback: (row) => (
        <span className="font-medium">
          {row.credits_cost || 0}
        </span>
      ),
    },
    {
      name: "created_at",
      title: "Created At",
      callback: (row) => (
        <div className="text-sm">
          <div>{moment(row.created_at).format("YYYY-MM-DD")}</div>
          <div className="text-muted-foreground">
            {moment(row.created_at).format("HH:mm:ss")}
          </div>
        </div>
      ),
    },
    {
      name: "actions",
      title: "Actions",
      callback: (row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (row.result_urls?.[0]) {
                window.open(row.result_urls[0], '_blank');
              }
            }}
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            View
          </button>
          <button
            onClick={() => {
              if (confirm('Are you sure you want to delete this photo?')) {
                // 这里可以添加删除逻辑
                fetch(`/api/admin/ai-generations/${row.id}`, {
                  method: 'DELETE'
                }).then(() => {
                  window.location.reload();
                });
              }
            }}
            className="text-red-600 hover:text-red-800 text-sm"
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg border">
          <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
          <div className="text-sm text-muted-foreground">Total Generations</div>
        </div>
        <div className="bg-white p-6 rounded-lg border">
          <div className="text-2xl font-bold text-green-600">{stats.success}</div>
          <div className="text-sm text-muted-foreground">Successful</div>
        </div>
        <div className="bg-white p-6 rounded-lg border">
          <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
          <div className="text-sm text-muted-foreground">Failed</div>
        </div>
        <div className="bg-white p-6 rounded-lg border">
          <div className="text-2xl font-bold text-yellow-600">{stats.processing}</div>
          <div className="text-sm text-muted-foreground">Processing</div>
        </div>
      </div>

      {/* 照片管理组件 */}
      <AdminPhotosClient
        photos={successPhotos}
        allOrders={allOrders}
      />
    </div>
  );
}
