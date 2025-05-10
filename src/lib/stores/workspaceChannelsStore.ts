import { Store, StoreResultState, type StoreResult } from "./store.svelte";
import {
  type Channel,
  createWorkspaceChannel,
  getWorkspaceChannels,
} from "$lib/api/workspaces/channels";

export type WorkspaceChannelsStoreResult = {
  channels: Channel[];
};

class WorkspaceChannelsStore extends Store<WorkspaceChannelsStoreResult> {
  public getDefaultState(): StoreResult<WorkspaceChannelsStoreResult> {
    return {
      state: StoreResultState.IDLE,
      data: {
        channels: [],
      },
    };
  }

  public async fetch(
    workspaceId: string,
  ): Promise<WorkspaceChannelsStoreResult> {
    this.changeState(StoreResultState.LOADING);
    const channels = await getWorkspaceChannels(workspaceId);
    this.changeStateAndData(StoreResultState.LOADED, {
      channels,
    });

    return this.getData();
  }

  public async create(
    workspaceId: string,
    name: string,
    topic: string,
    isPrivate: boolean,
    members: string[],
  ): Promise<Channel> {
      return createWorkspaceChannel(workspaceId, name, topic, isPrivate, members)
  }

  public put(channel: Channel): void {
    this.changeData({
      channels: [...this.getData().channels, channel],
    });
  }
}

export default new WorkspaceChannelsStore();
