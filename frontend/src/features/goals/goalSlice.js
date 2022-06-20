import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { TokenExpiredError } from 'jsonwebtoken'
import goalService from './goalService'


const initialState = {
    goals: [], 
    isError: false, 
    isSuccess: false, 
    isLoading: false, 
    message: '',
}

// Create new goal
export const createGoal = createAsyncThunk('goals/create', async (goalData, thunkAPI) => {

    try {

        const token = thunkAPI.getState().auth.user.token
        return await goalService.createGoal(goalData, token)

    } catch (error) {

        const message =
            (error.response &&
             error.response.data &&
             error.response.data.message) ||
            error.message ||
            error.toString()
      return thunkAPI.rejectWithValue(message)

    }
})

// Get user goals
export const getGoals = createAsyncThunk('goals/getAll', async (_, thunkAPI) => {
    try {
        const token = thunkAPI.getState().auth.user.token
        return await goalService.getGoals(token)
    } catch (error) {
        const message = (error.response && error.response.data && error.response.data.message) || 
        error.message ||
        error.toString()
        return thunkAPI.rejectWithValue(message)
        
    }
})

export const goalSlice = createSlice({
    name: 'goal', 
    initialState, 
    reducers: {
        reset:(state) => initialState,
    }, 
    extraReducers: (builder) => {
        builder 

            // Goal is Loading
            .addCase(createGoal.pending, (state) => {
                state.isLoading = true
            })

            // Goal is Created
            .addCase(createGoal.fulfilled, (state, action) => {
                state.isLoading = false
                state.isSuccess = true
                state.goals.push(action.payload)
            })

            // Goal is Rejected
            .addCase(createGoal.rejected, (state, action) => {
                state.isLoading = false
                state.isError = true 
                state.message = action.payload
            })
        
            //Last step I did before it crashed
            // Getting Goals is Loading
            // .addCase(getGoals.pending, (state) => {
            //     state.isLoading = true
            // })

            // // Goal is Created
            // .addCase(getGoals.fulfilled, (state, action) => {
            //     state.isLoading = false
            //     state.isSuccess = true
            //     state.goals = action.payload
            // })

            // // Goal is Rejected
            // .addCase(getGoals.rejected, (state, action) => {
            //     state.isLoading = false
            //     state.isError = true 
            //     state.message = action.payload
            // })
    },
})

export const { reset } = goalSlice.actions 
export default goalSlice.reducer