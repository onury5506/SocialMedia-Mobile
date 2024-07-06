import { UserProfileDTO } from '@/api/models/user-profile-dto';
import ProfileHeader from '@/components/ProfileHeader/ProfileHeader';
import { selectProfile } from '@/slices/userSlice';
import { router } from 'expo-router';
import { StyleSheet } from 'react-native';

import { Surface } from 'react-native-paper';
import { useSelector } from 'react-redux';

export default function ProfileScreen() {
  const user = useSelector(selectProfile)

  if (user === undefined) {
    return <Surface style={styles.container} children={null} />
  }

  return (
    <Surface style={styles.container} >
      <ProfileHeader profile={user} />
    </Surface>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flex: 1,
  }
});
