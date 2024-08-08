import { selectProfile } from "@/slices/userSlice";
import { Link, router, useNavigation } from "expo-router";
import { TouchableWithoutFeedback } from "react-native";
import { useSelector } from "react-redux";

export interface VisitUserProps {
    id: string;
    name: string;
    username: string;
    profilePicture?: string;
    profilePictureBlurhash?: string;
    children: React.ReactNode;
    replaceUrl?: boolean;
}

export default function VisitUser({
    id,
    name,
    username,
    profilePicture,
    profilePictureBlurhash,
    children,
    replaceUrl
}: VisitUserProps) {
    const user = useSelector(selectProfile)
    const url = `/[user]?id=${id}&username=${encodeURIComponent(username)}&name=${encodeURIComponent(name)}&profilePicture=${encodeURIComponent(profilePicture || '')}&profilePictureBlurhash=${encodeURIComponent(profilePictureBlurhash || '')}`

    function handlePress() {
        if (replaceUrl) {
            router.canGoBack() && router.back()
            router.push(url)
            return
        }

        router.push(url)
    }

    if (user?.id === id) {
        return children
    }

    return (
        <TouchableWithoutFeedback onPress={handlePress}>
            {children}
        </TouchableWithoutFeedback>
    )
}