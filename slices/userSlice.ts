import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '@/store/store'
import { TranslateResultDto } from '@/api/models';

export interface UserProfile {
    name: string;
    username: string;
    followers: number;
    following: number;
    posts: number;
    bio: TranslateResultDto;
    profilePicture: string;
}

export interface Auth {
    accessToken: string;
    refreshToken: string;
}

interface UserState {
    profile: UserProfile | null,
    auth: Auth | null
}

const initialState: UserState = {
    profile: null,
    auth: null
}

export const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setProfile: (state, action: PayloadAction<UserState['profile']>) => {
            state.profile = action.payload
        },
        setAuth: (state, action: PayloadAction<UserState['auth']>) => {
            state.auth = action.payload
        },
        clear: (state) => {
            state.profile = null
            state.auth = null
        }
    }
})

export const { setProfile, setAuth, clear } = userSlice.actions

export const selectProfile = (state: RootState) => state.user.profile
export const selectAuth = (state: RootState) => state.user.auth

export default userSlice.reducer