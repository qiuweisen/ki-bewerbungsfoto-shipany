"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import Icon from "@/components/icon";
import moment from "moment";
import { AIGenerationOrder } from "@/types/ai-generation-record";

interface AdminPhotosClientProps {
  photos: AIGenerationOrder[];
  allOrders: AIGenerationOrder[];
}

export default function AdminPhotosClient({ photos, allOrders }: AdminPhotosClientProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [providerFilter, setProviderFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("success");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  // 获取所有提供商列表
  const providers = useMemo(() => {
    const uniqueProviders = Array.from(new Set(allOrders.map(order => order.provider)));
    return uniqueProviders.filter(Boolean);
  }, [allOrders]);

  // 过滤数据
  const filteredData = useMemo(() => {
    let data = statusFilter === "success" ? photos : allOrders;
    
    if (statusFilter !== "all" && statusFilter !== "success") {
      data = allOrders.filter(order => order.status === statusFilter);
    }

    if (providerFilter !== "all") {
      data = data.filter(order => order.provider === providerFilter);
    }

    if (searchTerm) {
      data = data.filter(order =>
        order.prompt?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.user_uuid?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.id?.toString().includes(searchTerm)
      );
    }

    return data;
  }, [photos, allOrders, searchTerm, providerFilter, statusFilter]);

  // 删除照片
  const deletePhoto = async (photoId: number | undefined) => {
    if (!photoId) return;
    if (!confirm('Are you sure you want to delete this photo?')) return;

    try {
      const response = await fetch(`/api/admin/ai-generations/${photoId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Photo deleted successfully');
        window.location.reload();
      } else {
        throw new Error('Delete failed');
      }
    } catch (error) {
      console.error('Delete failed:', error);
      toast.error('Failed to delete photo');
    }
  };

  return (
    <div className="space-y-6">
      {/* 过滤器和搜索 */}
      <Card>
        <CardHeader>
          <CardTitle>Filters & Search</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Search</label>
              <Input
                placeholder="Search by prompt, user ID, or order ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="created">Created</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Provider</label>
              <Select value={providerFilter} onValueChange={setProviderFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Providers</SelectItem>
                  {providers.map(provider => (
                    <SelectItem key={provider} value={provider}>
                      {provider}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">View Mode</label>
              <Select value={viewMode} onValueChange={(value: "grid" | "table") => setViewMode(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="grid">Grid View</SelectItem>
                  <SelectItem value="table">Table View</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 结果统计 */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {filteredData.length} results
        </p>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.reload()}
          >
            <Icon name="RiRefreshLine" className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <Separator />

      {/* 数据展示 */}
      {viewMode === "grid" ? (
        <GridView data={filteredData} onDelete={deletePhoto} />
      ) : (
        <TableView data={filteredData} onDelete={deletePhoto} />
      )}
    </div>
  );
}

// 网格视图组件
function GridView({
  data,
  onDelete
}: {
  data: AIGenerationOrder[];
  onDelete: (id: number | undefined) => void;
}) {
  if (data.length === 0) {
    return (
      <div className="text-center py-12">
        <Icon name="RiImageLine" className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">No photos found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {data.map((order) => (
        <PhotoCard
          key={order.id}
          order={order}
          onDelete={() => onDelete(order.id)}
        />
      ))}
    </div>
  );
}

// 表格视图组件
function TableView({
  data,
  onDelete
}: {
  data: AIGenerationOrder[];
  onDelete: (id: number | undefined) => void;
}) {
  if (data.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No data found</p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <table className="w-full">
        <thead className="bg-muted/50">
          <tr>
            <th className="text-left p-4 font-medium">ID</th>
            <th className="text-left p-4 font-medium">Preview</th>
            <th className="text-left p-4 font-medium">User</th>
            <th className="text-left p-4 font-medium">Provider</th>
            <th className="text-left p-4 font-medium">Status</th>
            <th className="text-left p-4 font-medium">Created</th>
            <th className="text-left p-4 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.map((order) => (
            <tr key={order.id || `order-${Math.random()}`} className="border-t">
              <td className="p-4">#{order.id || 'N/A'}</td>
              <td className="p-4">
                {order.result_urls?.[0] ? (
                  <div className="relative w-12 h-12">
                    <Image
                      src={order.result_urls[0]}
                      alt="Generated image"
                      fill
                      className="object-cover rounded"
                    />
                  </div>
                ) : (
                  <div className="w-12 h-12 bg-muted rounded flex items-center justify-center">
                    <Icon name="RiImageLine" className="w-4 h-4 text-muted-foreground" />
                  </div>
                )}
              </td>
              <td className="p-4">
                <span className="text-xs font-mono bg-muted px-2 py-1 rounded">
                  {order.user_uuid?.slice(0, 8)}...
                </span>
              </td>
              <td className="p-4">
                <Badge variant="secondary">{order.provider}</Badge>
              </td>
              <td className="p-4">
                <StatusBadge status={order.status} />
              </td>
              <td className="p-4 text-sm text-muted-foreground">
                {moment(order.created_at).format("MM-DD HH:mm")}
              </td>
              <td className="p-4">
                <div className="flex items-center gap-2">
                  {order.result_urls?.[0] && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(order.result_urls![0], '_blank')}
                    >
                      View
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => onDelete(order.id)}
                  >
                    Delete
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// 照片卡片组件
function PhotoCard({
  order,
  onDelete
}: {
  order: AIGenerationOrder;
  onDelete: () => void;
}) {
  const firstImageUrl = order.result_urls?.[0];
  
  return (
    <Card className="group relative overflow-hidden">
      <CardContent className="p-0">
        {/* 图片或状态显示 */}
        <div className="relative aspect-square">
          {firstImageUrl ? (
            <Image
              src={firstImageUrl}
              alt={order.prompt || "Generated image"}
              fill
              className="object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <div className="text-center">
                <Icon name="RiImageLine" className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                <StatusBadge status={order.status} />
              </div>
            </div>
          )}
          
          {/* 悬停操作按钮 */}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            {firstImageUrl && (
              <Button
                size="sm"
                variant="secondary"
                onClick={() => window.open(firstImageUrl, '_blank')}
              >
                <Icon name="RiEyeLine" className="w-4 h-4" />
              </Button>
            )}
            
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm" variant="secondary">
                  <Icon name="RiInformationLine" className="w-4 h-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Order Details</DialogTitle>
                </DialogHeader>
                <OrderDetails order={order} />
              </DialogContent>
            </Dialog>
            
            <Button
              size="sm"
              variant="destructive"
              onClick={onDelete}
            >
              <Icon name="RiDeleteBinLine" className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* 订单信息 */}
        <div className="p-3 space-y-2">
          <div className="flex items-center justify-between">
            <Badge variant="secondary" className="text-xs">
              {order.provider}
            </Badge>
            <span className="text-xs text-muted-foreground">
              #{order.id || 'N/A'}
            </span>
          </div>
          
          <p className="text-sm text-muted-foreground line-clamp-2">
            {order.prompt || "No prompt"}
          </p>
          
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{moment(order.created_at).format("MM-DD HH:mm")}</span>
            <span className="font-mono">
              {order.user_uuid?.slice(0, 8)}...
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// 状态徽章组件
function StatusBadge({ status }: { status: string }) {
  const variants = {
    success: "bg-green-100 text-green-800",
    failed: "bg-red-100 text-red-800",
    processing: "bg-yellow-100 text-yellow-800",
    created: "bg-blue-100 text-blue-800",
    credits_deducted: "bg-purple-100 text-purple-800",
  };

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${variants[status as keyof typeof variants] || 'bg-gray-100 text-gray-800'}`}>
      {status}
    </span>
  );
}

// 订单详情组件
function OrderDetails({ order }: { order: AIGenerationOrder }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Order ID</label>
          <p className="text-sm text-muted-foreground">#{order.id || 'N/A'}</p>
        </div>
        <div>
          <label className="text-sm font-medium">User UUID</label>
          <p className="text-sm text-muted-foreground font-mono">{order.user_uuid}</p>
        </div>
        <div>
          <label className="text-sm font-medium">Provider</label>
          <p className="text-sm text-muted-foreground">{order.provider}</p>
        </div>
        <div>
          <label className="text-sm font-medium">Model</label>
          <p className="text-sm text-muted-foreground">{order.model}</p>
        </div>
        <div>
          <label className="text-sm font-medium">Status</label>
          <StatusBadge status={order.status} />
        </div>
        <div>
          <label className="text-sm font-medium">Credits Cost</label>
          <p className="text-sm text-muted-foreground">{order.credits_cost || 0}</p>
        </div>
      </div>

      <div>
        <label className="text-sm font-medium">Prompt</label>
        <p className="text-sm text-muted-foreground mt-1 p-2 bg-muted rounded">
          {order.prompt || "No prompt"}
        </p>
      </div>

      <div>
        <label className="text-sm font-medium">Created At</label>
        <p className="text-sm text-muted-foreground">
          {moment(order.created_at).format("YYYY-MM-DD HH:mm:ss")}
        </p>
      </div>

      {order.result_urls && order.result_urls.length > 0 && (
        <div>
          <label className="text-sm font-medium">Generated Images</label>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {order.result_urls.map((url, index) => (
              <div key={index} className="relative aspect-square">
                <Image
                  src={url}
                  alt={`Generated image ${index + 1}`}
                  fill
                  className="object-cover rounded"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
