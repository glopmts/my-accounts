import useUserQuery from "@/services/query/use-data-query";
import { useUser } from "@clerk/nextjs";

export const useAuthCustom = () => {
  const { isSignedIn, user: clerkUser, isLoaded: isClerkLoaded } = useUser();

  const {
    data: user,
    isLoading: isUserLoading,
    error: userError,
    refetch,
    isRefetching,
  } = useUserQuery(clerkUser?.id);

  return {
    isSignedIn,
    clerkUser,
    isClerkLoaded,

    user,
    userId: user?.id || "",
    isLoading: isUserLoading,
    error: userError,
    refetch,
    isRefetching,

    isAuthenticated: isSignedIn && !!user,
    isLoadingComplete: isClerkLoaded && !isUserLoading,

    userData: user || {
      id: clerkUser?.id || "",
      email: clerkUser?.emailAddresses[0]?.emailAddress || "",
      name: clerkUser?.fullName || "",
      avatar: clerkUser?.imageUrl || "",
    },
  };
};
