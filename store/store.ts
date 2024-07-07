import userReducer from '@/slices/userSlice'
import activeVideoReducer from '@/slices/activeVideoSlice'
import { configureStore } from '@reduxjs/toolkit'

const store = configureStore({
  reducer: {
    user: userReducer,
    activeVideo: activeVideoReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
export default store