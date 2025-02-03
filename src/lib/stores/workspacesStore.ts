import {Store, StoreResultState, type StoreResult} from "./store.svelte"
import {getWorkspaces, createWorkspace, type Workspace, type WorkspaceType, updateWorkspaceIcon} from "../api/workspaces/workspace"


export type WorkspaceStoreResult = {
    workspaces: Workspace[];
}

class WorkspacesStore extends Store<WorkspaceStoreResult> {

    public getDefaultState(): StoreResult<WorkspaceStoreResult> {
        return {
            state: StoreResultState.IDLE,
            data: {
                workspaces: [],
            }
        }
    }

    public fetch(): Promise<WorkspaceStoreResult> {
        // eslint-disable-next-line no-async-promise-executor
        return new Promise<WorkspaceStoreResult>(async (resolve, reject) => {
            try {
                this.changeState(StoreResultState.LOADING);
                const workspaces = await getWorkspaces();
                this.changeStateAndData(StoreResultState.LOADED, {
                    workspaces: workspaces
                });

                resolve(this.getData());
            } catch (e) {
                // this.triggerError(e as Error, unableToFetchWorkspaces);
                reject(e);
            }
        })
    }

    public createWorkspace(workspaceName: string, type: WorkspaceType, iconImage: File | undefined): Promise<Workspace> {
        // eslint-disable-next-line no-async-promise-executor
        return new Promise<Workspace>(async (resolve, reject) => {
            try {
                const workspace = await createWorkspace(workspaceName, type);

                if (iconImage) {
                    await updateWorkspaceIcon(workspace.id, iconImage);
                }

                this.changeData({
                    ...this.getData(),
                    workspaces: [...this.getData().workspaces, workspace]
                });
                resolve(workspace);
            } catch (e) {
                reject(e);
            }
        });
    }

//
//     public deleteWorkspace(workspaceId: string): Promise<void> {
//         // eslint-disable-next-line no-async-promise-executor
//         return new Promise<void>(async (resolve, reject) => {
//             try {
//                 await deleteWorkspace(workspaceId);
//                 this.changeData({
//                     ...this.getData(),
//                     workspaces: this.getData().workspaces.filter(c => c.id !== workspaceId)
//                 });
//                 resolve();
//             } catch (e) {
//                 reject(e);
//             }
//         });
//     }
//
//     public editWorkspace(workspaceId: string, workspaceName: string): Promise<Workspace> {
//         // eslint-disable-next-line no-async-promise-executor
//         return new Promise<Workspace>(async (resolve, reject) => {
//             try {
//                 const workspace = await editWorkspace(workspaceId, workspaceName);
//                 const workspaces = this.getData().workspaces.map(c => c.id === workspaceId ? workspace : c);
//                 this.changeData({
//                     ...this.getData(),
//                     workspaces
//                 });
//                 resolve(workspace);
//             } catch (e) {
//                 reject(e);
//             }
//         });
//     }
}

export default new WorkspacesStore();