'use client';

import { isToday, isYesterday, subMonths, subWeeks } from 'date-fns';
import { Link } from 'react-router-dom';
import { useParams, useLocation, useNavigate as useRouter } from 'react-router-dom';
import { memo, useState } from 'react';
import { toast } from 'sonner';
import useSWR from 'swr';
import { useGlobalStore } from '@/store/globalStore';


import {
  MoreHorizontalIcon,
  TrashIcon,
} from '@/components/chat/icons';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { ApiChatListByAppId, RespChat, ApiUpdateChatInfo } from "@/service/api";
import { useToast } from '@/hooks/use-toast';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { EditIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppSideBarHistoryListContext } from '@/components/app-sidebar';
import React from 'react';
import { getFirstPathSegment } from '@/lib/utils';
import { useSidebarDialog } from '../sidebar/sidebar-dialog';

type GroupedChats = {
  today: RespChat[];
  yesterday: RespChat[];
  lastWeek: RespChat[];
  lastMonth: RespChat[];
  older: RespChat[];
};

const PureChatItem = ({
  chat,
  isActive,
  onDelete,
  setOpenMobile,
}: {
  chat: RespChat;
  isActive: boolean;
  onDelete: (chatId: string) => void;
  setOpenMobile: (open: boolean) => void;
}) => {
  const { handleClose } = useSidebarDialog();
  const { activeMenu } = useAppSideBarHistoryListContext();
  const appId = activeMenu?.appId;
  const location = useLocation();
  const { toast } = useToast();
  const [title, setTitle] = useState(chat.title);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdateChat = async () => {
    try {
      setIsUpdating(true);
      await ApiUpdateChatInfo(chat.id, {
        title,
      });
      toast({
        title: "Chat information updated successfully"
      });
    } catch (error) {
      toast({
        title: "Update failed",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
      setShowUpdatePopover(false);
    }
  };

  const [showUpdatePopover, setShowUpdatePopover] = useState(false);

  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={isActive}>
        <Link
          to={`${getFirstPathSegment(location.pathname)}/${appId}/c/${chat.id}`}
          onClick={() => {
            setOpenMobile(false);
            handleClose();
          }}
        >
          <span>{chat.title}</span>
        </Link>
      </SidebarMenuButton>

      <div className="flex items-center gap-2">
        <DropdownMenu modal={true}>
          <DropdownMenuTrigger asChild>
            <SidebarMenuAction
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground mr-0.5"
              showOnHover={!isActive}
            >
              <MoreHorizontalIcon />
              <span className="sr-only">More</span>
            </SidebarMenuAction>
          </DropdownMenuTrigger>

          <DropdownMenuContent side="bottom" align="end" onMouseDown={(e) => {
            e.stopPropagation()
          }}>
            <DropdownMenuItem
              className="cursor-pointer"
              onSelect={() => {
                setShowUpdatePopover(true)
              }}
            >
              <EditIcon />
              <span>Update</span>
            </DropdownMenuItem>

            <DropdownMenuItem
              className="cursor-pointer text-destructive focus:bg-destructive/15 focus:text-destructive dark:text-red-500"
              onSelect={() => onDelete(chat.id)}
            >
              <TrashIcon />
              <span>Delete</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Popover open={showUpdatePopover} modal={true}>
          <PopoverTrigger asChild>
            <div style={{ display: 'none' }} />
          </PopoverTrigger>
          <PopoverContent className="ml-80 w-80" side="bottom" align="end"
            sideOffset={5} alignOffset={-30} onMouseDown={e => e.stopPropagation()}>
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter chat title"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setTitle(chat.title);
                    setShowUpdatePopover(false);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleUpdateChat}
                  disabled={isUpdating}
                >
                  {isUpdating ? "Updating..." : "Save Changes"}
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </SidebarMenuItem>
  );
};

export const ChatItem = memo(PureChatItem, (prevProps, nextProps) => {
  if (prevProps.isActive !== nextProps.isActive) return false;
  return true;
});

export function SidebarHistory() {
  const { setOpenMobile } = useSidebar();
  const { activeMenu } = useAppSideBarHistoryListContext();
  const { handleClose } = useSidebarDialog()
  const appId = activeMenu?.appId;
  const { chatId } = useParams();
  const location = useLocation();
  const user = useGlobalStore((state) => state.user);
  const {
    data: chatListResp,
    isLoading,
    mutate,
  } = useSWR<RespChat[]>(user && appId ? ['ApiChatListByAppId', appId, user] : null,
    () => ApiChatListByAppId(appId as string),
    {
      fallbackData: [],
    });

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const router = useRouter();
  const handleDelete = async () => {
    const deletePromise = fetch(`/api/chat/${deleteId}`, {
      method: 'DELETE',
    });

    toast.promise(deletePromise, {
      loading: 'Deleting conversation...',
      success: () => {
        mutate();
        handleClose();
        return 'Conversation deleted successfully';
      },
      error: 'Failed to delete conversation',
    });

    setShowDeleteDialog(false);

    if (deleteId === chatId) {
      router('/');
    }
  };

  const renderNewChatButton = () => (
    <Button
      variant="default"
      className="w-full flex items-center justify-center gap-2"
      onClick={() => {
        const path = `${getFirstPathSegment(location.pathname)}/${appId}`;
        router(path);
        setOpenMobile(false);
        handleClose();
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
        className="w-4 h-4"
      >
        <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
      </svg>
      New Chat
    </Button>
  );

  if (!user) {
    return (
      <SidebarGroup>
        <SidebarGroupContent>
          <div className="px-2 text-zinc-500 w-full flex flex-row justify-center items-center text-sm gap-2">
            Login to save and revisit previous chats!
          </div>
        </SidebarGroupContent>
      </SidebarGroup>
    );
  }

  if (isLoading) {
    return (
      <SidebarGroup>
        <div className="px-2 py-1 text-xs text-sidebar-foreground/50">
          Today
        </div>
        <SidebarGroupContent>
          <div className="flex flex-col">
            {[44, 32, 28, 64, 52].map((item) => (
              <div
                key={item}
                className="rounded-md h-8 flex gap-2 px-2 items-center"
              >
                <div
                  className="h-4 rounded-md flex-1 max-w-[--skeleton-width] bg-sidebar-accent-foreground/10"
                  style={
                    {
                      '--skeleton-width': `${item}%`,
                    } as React.CSSProperties
                  }
                />
              </div>
            ))}
          </div>
        </SidebarGroupContent>
      </SidebarGroup>
    );
  }

  if (chatListResp?.length === 0) {
    return (
      <SidebarGroup>
        <SidebarGroupContent>
          {renderNewChatButton()}
          <div className="px-2 py-2 text-zinc-500 w-full flex flex-col justify-center items-center gap-4">
            <span className="text-sm text-center">
              Your conversations will appear here once you start chatting!
            </span>
          </div>
        </SidebarGroupContent>
      </SidebarGroup>
    );
  }

  const groupChatsByDate = (chats: RespChat[]): GroupedChats => {
    const now = new Date();
    const oneWeekAgo = subWeeks(now, 1);
    const oneMonthAgo = subMonths(now, 1);

    return chats.reduce(
      (groups, chat) => {
        const chatDate = new Date(chat.createdAt * 1000);

        if (isToday(chatDate)) {
          groups.today.push(chat);
        } else if (isYesterday(chatDate)) {
          groups.yesterday.push(chat);
        } else if (chatDate > oneWeekAgo) {
          groups.lastWeek.push(chat);
        } else if (chatDate > oneMonthAgo) {
          groups.lastMonth.push(chat);
        } else {
          groups.older.push(chat);
        }

        return groups;
      },
      {
        today: [],
        yesterday: [],
        lastWeek: [],
        lastMonth: [],
        older: [],
      } as GroupedChats,
    );
  };

  return (
    <>
      <SidebarGroup>
        <SidebarGroupContent>
          {renderNewChatButton()}
          <SidebarMenu>
            {chatListResp &&
              (() => {
                const groupedChats = groupChatsByDate(chatListResp);
                return (
                  <>
                    {groupedChats.today.length > 0 && (
                      <>
                        <div className="relative px-2 py-1 flex justify-between items-center">
                          <span className="text-xs text-sidebar-foreground/50">Today</span>
                        </div>
                        {groupedChats.today.map((chat) => (
                          <ChatItem
                            key={chat.id}
                            chat={chat}
                            isActive={chat.id === chatId}
                            onDelete={(chatId) => {
                              setDeleteId(chatId);
                              setShowDeleteDialog(true);
                            }}
                            setOpenMobile={setOpenMobile}
                          />
                        ))}
                      </>
                    )}

                    {groupedChats.yesterday.length > 0 && (
                      <>
                        <div className="px-2 py-1 text-xs text-sidebar-foreground/50">
                          Yesterday
                        </div>
                        {groupedChats.yesterday.map((chat) => (
                          <ChatItem
                            key={chat.id}
                            chat={chat}
                            isActive={chat.id === chatId}
                            onDelete={(chatId) => {
                              setDeleteId(chatId);
                              setShowDeleteDialog(true);
                            }}
                            setOpenMobile={setOpenMobile}
                          />
                        ))}
                      </>
                    )}

                    {groupedChats.lastWeek.length > 0 && (
                      <>
                        <div className="px-2 py-1 text-xs text-sidebar-foreground/50 mt-6">
                          Last 7 days
                        </div>
                        {groupedChats.lastWeek.map((chat) => (
                          <ChatItem
                            key={chat.id}
                            chat={chat}
                            isActive={chat.id === chatId}
                            onDelete={(chatId) => {
                              setDeleteId(chatId);
                              setShowDeleteDialog(true);
                            }}
                            setOpenMobile={setOpenMobile}
                          />
                        ))}
                      </>
                    )}

                    {groupedChats.lastMonth.length > 0 && (
                      <>
                        <div className="px-2 py-1 text-xs text-sidebar-foreground/50 mt-6">
                          Last 30 days
                        </div>
                        {groupedChats.lastMonth.map((chat) => (
                          <ChatItem
                            key={chat.id}
                            chat={chat}
                            isActive={chat.id === chatId}
                            onDelete={(chatId) => {
                              setDeleteId(chatId);
                              setShowDeleteDialog(true);
                            }}
                            setOpenMobile={setOpenMobile}
                          />
                        ))}
                      </>
                    )}

                    {groupedChats.older.length > 0 && (
                      <>
                        <div className="px-2 py-1 text-xs text-sidebar-foreground/50 mt-6">
                          Older
                        </div>
                        {groupedChats.older.map((chat) => (
                          <ChatItem
                            key={chat.id}
                            chat={chat}
                            isActive={chat.id === chatId}
                            onDelete={(chatId) => {
                              setDeleteId(chatId);
                              setShowDeleteDialog(true);
                            }}
                            setOpenMobile={setOpenMobile}
                          />
                        ))}
                      </>
                    )}
                  </>
                );
              })()}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              chat and remove it from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
