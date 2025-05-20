import CurrentTrip from "@/components/CurrentTrip";
import Loading from "@/components/Loading";
import NoTrip from "@/components/NoTrip";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/clerk-expo";
import { useQuery } from "convex/react";
import React from "react";

export default function Trip() {
  const { user } = useUser();

  const clerkId = user?.id;

  const fullUser = useQuery(
    api.users.getUserByClerk,
    clerkId ? { clerkId: clerkId } : "skip"
  );

  if (fullUser === undefined) {
    return <Loading />;
  }
  if (fullUser?.tripId) {
    // user has trip id
    return <CurrentTrip />;
  } else {
    return <NoTrip />;
  }
}
