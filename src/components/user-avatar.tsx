import * as React from "react";
import {useGlobalStore} from "@/store/globalStore";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {AvatarUser, UserProfile} from "@/service/api";

export function MyUserAvatar() {
    const user = useGlobalStore(state => state.user);
    return (
        <UserAvatar
            user={user}
        />
    )
}

export function UserAvatar({ user }: {user: AvatarUser}) {
    return (
        <Avatar className="h-8 w-8 rounded-lg">
            {user && <AvatarImage src={user.avatar} alt={user.name} />}
            {user &&<AvatarFallback className="rounded-full bg-gradient-to-br from-green-400 to-blue-500 text-white">{user?.name.charAt(0)}</AvatarFallback>}
        </Avatar>
    )
}
