import {Store, StoreResultState, type StoreResult} from "./store.svelte"
import {type Channel, createWorkspaceChannel, getWorkspaceChannels} from "$lib/api/workspaces/channels";
import ws from "$lib/api/ws";

export type WorkspaceChannelsStoreResult = {
    channels: Channel[];
}

class WorkspaceChannelsStore extends Store<WorkspaceChannelsStoreResult> {

    public getDefaultState(): StoreResult<WorkspaceChannelsStoreResult> {
        return {
            state: StoreResultState.IDLE,
            data: {
                channels: [],
            }
        }
    }

    public fetch(workspaceId: string): Promise<WorkspaceChannelsStoreResult> {
        // eslint-disable-next-line no-async-promise-executor
        return new Promise<WorkspaceChannelsStoreResult>(async (resolve, reject) => {
            try {
                this.changeState(StoreResultState.LOADING);
                const channels = await getWorkspaceChannels(workspaceId);
                this.changeStateAndData(StoreResultState.LOADED, {
                    channels
                });

                resolve(this.getData());
            } catch (e) {
                // this.triggerError(e as Error, unableToFetchWorkspaces);
                reject(e);
            }
        })
    }

    public async create(workspaceId: string, name: string, topic: string): Promise<void> {
        await createWorkspaceChannel(workspaceId, name, topic);
    }

    public put(channel: Channel): void {
        this.changeData({
            channels: [...this.getData().channels, channel]
        });
    }

}

export default new WorkspaceChannelsStore();