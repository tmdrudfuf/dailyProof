import { NavigatorScreenParams } from '@react-navigation/native';

export type ProfileStackParamList = {
  ProfileHome: undefined;
  MyGoals: undefined;
  CreateGoal: undefined;
};

export type RootTabParamList = {
  Feed: undefined;
  Camera: undefined;
  Profile: NavigatorScreenParams<ProfileStackParamList> | undefined;
};
