import { getRecentChats, type RecentChat } from "../api/recentChats";
import { Store, StoreResultState, type StoreResult } from "./store.svelte";

export type RecentChatsStoreResult = {
    recentChats: RecentChat[];
};

class RecentChatsStore extends Store<RecentChatsStoreResult> {
    public getDefaultState(): StoreResult<RecentChatsStoreResult> {
        return {
            state: StoreResultState.IDLE,
            data: {
                recentChats: [],
            },
        };
    }

    public fetch(): Promise<RecentChatsStoreResult> {
        // eslint-disable-next-line no-async-promise-executor
        return new Promise<RecentChatsStoreResult>(async (resolve, reject) => {
            try {
                this.changeState(StoreResultState.LOADING);
                const recentChats = await getRecentChats();
                this.changeStateAndData(StoreResultState.LOADED, {
                    recentChats,
                });

                resolve(this.getData());
            } catch (e) {
                // this.triggerError(e as Error, unableToFetchWorkspaces);
                reject(e);
            }
        });
    }

    public async add(chat: RecentChat): Promise<void> {
        // Add the chat to the recent chats list (first position)
        this.changeData({
            recentChats: [chat, ...this.getData().recentChats]
        });
    }
}

export default new RecentChatsStore();
