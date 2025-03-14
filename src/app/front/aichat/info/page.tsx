'use client';
import { useParams } from 'react-router-dom';
import { Chat } from '@/components/chat/chat';
import { convertToUIMessages } from '@/lib/utils';
import { DataStreamHandler } from '@/components/chat/data-stream-handler';
import useSWR from "swr";
import { Suspense } from "react";
import { RespChat, RespChatHistoryMessage, ApiChatHistory, ApiGetChat } from '@/service/api'
import { useGlobalStore } from '@/store/globalStore';
import { RightSettingProvider } from '../component/rightSetting';
import { useChatStore } from '@/store/chatStore';

export function ChatWrapper() {
    const { appId, chatId: id } = useParams();
    const user = useGlobalStore(state => state.user);
    const selectedModelId = useChatStore(state => state.modelSelectedId)

    const { data: chatResp } = useSWR<RespChat>(
        id ? ['ApiGetChat', id] : null,
        () => ApiGetChat(id!),
    );

    const { data: messageHistoryResp } = useSWR<RespChatHistoryMessage[]>(
        id ? ['ApiChatHistory', id] : null,
        () => ApiChatHistory(id!),
    );

    return (
        <RightSettingProvider>
            <div className="flex-1 flex overflow-hidden h-screen">
                {<Chat
                    id={id!}
                    initialMessages={convertToUIMessages(messageHistoryResp || [])}
                    selectedModelId={selectedModelId}
                    chatInfo={chatResp!}
                    isReadonly={user.id !== chatResp?.uid}
                    appId={appId!}
                />}
                <DataStreamHandler id={id!} />
                {/* <RightSidebar /> */}
            </div >
        </RightSettingProvider>
    );
}

export default function Page() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ChatWrapper />
        </Suspense>
    );
}

