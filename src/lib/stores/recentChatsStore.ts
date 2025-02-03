import {Store, StoreResultState, type StoreResult} from "./store.svelte"
import {getRecentChats, type RecentChat} from "../api/recentChats";


export type RecentChatsStoreResult = {
    recentChats: RecentChat[];
}

class RecentChatsStore extends Store<RecentChatsStoreResult> {

    public getDefaultState(): StoreResult<RecentChatsStoreResult> {
        return {
            state: StoreResultState.IDLE,
            data: {
                recentChats: [],
            }
        }
    }

    public fetch(): Promise<RecentChatsStoreResult> {
        // eslint-disable-next-line no-async-promise-executor
        return new Promise<RecentChatsStoreResult>(async (resolve, reject) => {
            try {
                this.changeState(StoreResultState.LOADING);
                const recentChats = await getRecentChats();
                this.changeStateAndData(StoreResultState.LOADED, {
                    recentChats
                });

                resolve(this.getData());
            } catch (e) {
                // this.triggerError(e as Error, unableToFetchWorkspaces);
                reject(e);
            }
        })
    }
}

export default new RecentChatsStore();