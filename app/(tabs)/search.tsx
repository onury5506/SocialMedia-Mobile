import { useFocusEffect, useGlobalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Surface, Text, Searchbar } from "react-native-paper";
import { FlatList, StyleSheet } from "react-native";
import { searchUsers } from "@/api/user.api";
import { MiniUserProfile } from "@/api/models";
import MiniProfile from "@/components/MiniProfile";
import { set } from "react-hook-form";

export interface SearchParams {
    searchStartText?: string
}

export default function Search() {
    const params = useGlobalSearchParams() as any as SearchParams
    const [focused, setFocused] = useState(false)
    const [searchText, setSearchText] = useState("")
    const [users, setUsers] = useState<MiniUserProfile[]>([])

    useFocusEffect(useCallback(() => {
        setFocused(true)
        return () => {
            setFocused(false)
        }
    }, []))

    useEffect(() => {
        if (focused) {
            setSearchText(params.searchStartText || "")
        } else {
            setSearchText("")
            setUsers([])
        }
    }, [focused])

    useEffect(() => {

        if (searchText.length == 0) {
            setUsers([])
            return
        }

        let cancelled = false
        const abortController = new AbortController()

        const timer = setTimeout(async () => {
            const res = await searchUsers(searchText.toLocaleLowerCase(), { signal: abortController.signal })
            if (cancelled) {
                return
            }
            setUsers(res)
        }, 300)

        return () => {
            clearTimeout(timer)
            abortController.abort()
            cancelled = true
        }
    }, [searchText])

    return (
        <Surface style={styles.container}>
            {focused && <Searchbar
                placeholder="Search"
                onChangeText={setSearchText}
                value={searchText}
                autoFocus={true}
            />}
            <FlatList
                data={users}
                renderItem={({ item }) => <MiniProfile key={item.id} {...item} replaceUrl={true} />}
                keyExtractor={(item) => item.id}
                style={{ width: "100%" }}
            />
        </Surface>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    }
});