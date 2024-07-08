import { selectProfile } from "@/slices/userSlice";
import { Link, router } from "expo-router";
import { useSelector } from "react-redux";

export interface VisitUserProps {
    id: string;
    name: string;
    username: string;
    profilePicture?: string;
    profilePictureBlurhash?: string;
    children: React.ReactNode;
}

export default function VisitUser({
    id,
    name,
    username,
    profilePicture,
    profilePictureBlurhash,
    children
}: VisitUserProps) {
    const user = useSelector(selectProfile)
    const url = `/[user]?id=${id}&username=${encodeURIComponent(username)}&name=${encodeURIComponent(name)}&profilePicture=${encodeURIComponent(profilePicture || '')}&profilePictureBlurhash=${encodeURIComponent(profilePictureBlurhash || '')}`
    
    if (user?.id === id) {
        return children
    }

    return (
        <Link href={url} >
            {children}
        </Link>
    )
}