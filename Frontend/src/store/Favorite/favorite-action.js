import { favoriteAction } from "./favorite-slice";
import { axiosInstance } from "../../utils/axios";
import toast from "react-hot-toast";

export const getMyFavorites = () => async (dispatch) => {
  try {
    dispatch(favoriteAction.setLoading(true));
    const { data } = await axiosInstance.get("/v1/rent/user/favorites");
    dispatch(favoriteAction.setFavorites(data.data));
  } catch (error) {
    dispatch(favoriteAction.setError(error.response?.data?.message || "Failed to load favorites"));
  }
};

export const toggleFavorite = (propertyId, propertyObj) => async (dispatch) => {
  try {
    const { data } = await axiosInstance.post(`/v1/rent/user/favorites/${propertyId}`);
    
    if (data.isFavorite) {
      // Optimitically added to UI, but if we have the object we can add it properly
      dispatch(favoriteAction.addFavorite({ property: propertyObj || { _id: propertyId } }));
      toast.success("Added to favorites ❤️");
    } else {
      dispatch(favoriteAction.removeFavorite(propertyId));
      toast.success("Removed from favorites");
    }
  } catch (error) {
    toast.error(error.response?.data?.message || "Failed to update favorite");
    dispatch(favoriteAction.setError(error.response?.data?.message || "Failed to update favorite"));
  }
};
