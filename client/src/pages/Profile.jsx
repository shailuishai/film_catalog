import React, { useState } from "react";
import {
    Box,
    Flex,
    Avatar,
    Text,
    Button,
    useColorModeValue,
    Input,
    FormControl,
    FormLabel,
    IconButton,
    Spinner,
    useToast,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    Divider,
} from "@chakra-ui/react";
import { EditIcon, CheckIcon, CloseIcon } from "@chakra-ui/icons";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { FaSignOutAlt } from "react-icons/fa"; // Импортируем иконку выхода

const MotionBox = motion.create(Box);

const Profile = () => {
    const { user, isLoading, logout, updateProfile, deleteProfile } = useAuth();
    const toast = useToast();
    const bgColor = useColorModeValue("white", "brand.900");
    const borderColor = useColorModeValue("gray.200", "brand.800");
    const textColor = useColorModeValue("brand.900", "white");
    const [editMode, setEditMode] = useState(null);
    const [login, setLogin] = useState(user?.login || "");
    const [avatarFile, setAvatarFile] = useState(null);
    const [resetAvatar, setResetAvatar] = useState(false);
    const avatarPrefix = useColorModeValue("_Light", "_Dark");

    const handleLoginChange = (e) => {
        setLogin(e.target.value);
    };

    const handleAvatarChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            try {
                await updateProfile({}, file, false); // Загружаем новый аватар
                toast({
                    title: "Аватар обновлен",
                    status: "success",
                    duration: 3000,
                    isClosable: true,
                });
                setAvatarFile(file); // Обновляем состояние
            } catch (error) {
                toast({
                    title: "Ошибка",
                    description: "Не удалось обновить аватар",
                    status: "error",
                    duration: 3000,
                    isClosable: true,
                });
            }
        }
    };

    const handleSubmit = async () => {
        try {
            if (editMode === "login") {
                await updateProfile({ login }, null, false);
                toast({
                    title: "Логин обновлен",
                    status: "success",
                    duration: 3000,
                    isClosable: true,
                });
                setEditMode(null); // Выход из режима редактирования
            }
        } catch (error) {
            toast({
                title: "Ошибка",
                description: "Не удалось обновить данные",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        }
    };

    const handleCancel = () => {
        setEditMode(null);
        setLogin(user?.login || ""); // Сбрасываем логин к исходному значению
    };

    const handleDeleteProfile = async () => {
        try {
            await deleteProfile();
            toast({
                title: "Профиль удален",
                status: "success",
                duration: 3000,
                isClosable: true,
            });
            logout();
        } catch (error) {
            toast({
                title: "Ошибка",
                description: "Не удалось удалить профиль",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        }
    };

    const isDefaultAvatar = user?.avatar_url?.includes("default");
    const avatarUrl = user
        ? isDefaultAvatar
            ? `${user.avatar_url}512x512${avatarPrefix}.webp`
            : `${user.avatar_url}512x512.webp`
        : null;

    return (
        <Flex justify="center" align="center" minH="100vh" bg={bgColor}>
            <AnimatePresence>
                <MotionBox
                    initial={{ opacity: 0, x: -400 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 400 }}
                    transition={{ duration: 0.5 }}
                    position="relative"
                    zIndex={20}
                    p={6}
                    borderWidth="2px"
                    borderRadius="md"
                    borderColor={borderColor}
                    boxShadow="lg"
                    bg={bgColor}
                    color={textColor}
                    textAlign="center"
                    maxW="600px"
                    w="100%"
                >
                    {isLoading ? (
                        <Spinner size="xl" aria-label="Loading" />
                    ) : (
                        <>
                            <Box position="relative" display="inline-block" w="100%" pb={4} borderColor={borderColor} borderBottomWidth="2px">
                                <Avatar size="2xl" src={avatarUrl} />
                                <Menu>
                                    <MenuButton
                                        as={IconButton}
                                        aria-label="Edit Avatar"
                                        icon={<EditIcon />}
                                        position="absolute"
                                        right={0}
                                        size="sm"
                                    />
                                    <MenuList
                                        bg={bgColor}
                                        borderColor={borderColor}
                                        borderWidth="2px"
                                        borderRadius="md"
                                        boxShadow="lg"
                                        color={textColor}
                                    >
                                        <MenuItem
                                            bg={bgColor}
                                            _hover={{ bg: useColorModeValue("gray.100", "brand.700") }}
                                            _focus={{ bg: useColorModeValue("gray.100", "brand.700") }}
                                            onClick={() => {
                                                document.getElementById("avatar-input").click();
                                            }}
                                        >
                                            Загрузить фото
                                        </MenuItem>
                                        <MenuItem
                                            bg={bgColor}
                                            _hover={{ bg: useColorModeValue("gray.100", "brand.700") }}
                                            _focus={{ bg: useColorModeValue("gray.100", "brand.700") }}
                                            onClick={async () => {
                                                try {
                                                    await updateProfile({}, null, true); // Удаляем аватар
                                                    toast({
                                                        title: "Аватар удален",
                                                        status: "success",
                                                        duration: 3000,
                                                        isClosable: true,
                                                    });
                                                } catch (error) {
                                                    toast({
                                                        title: "Ошибка",
                                                        description: "Не удалось удалить аватар",
                                                        status: "error",
                                                        duration: 3000,
                                                        isClosable: true,
                                                    });
                                                }
                                            }}
                                        >
                                            Удалить фото
                                        </MenuItem>
                                    </MenuList>
                                </Menu>
                            </Box>

                            <Input
                                id="avatar-input"
                                type="file"
                                accept="image/*"
                                onChange={handleAvatarChange}
                                display="none"
                            />

                            {/* Логин с подписью */}
                            <FormControl py={4} borderColor={borderColor} borderBottomWidth="2px">
                                <FormLabel fontWeight="bold" mb={2}>
                                    Логин
                                </FormLabel>
                                <Flex align="center" justify="space-between">
                                    {editMode === "login" ? (
                                        <Input
                                            type="text"
                                            variant="flushed"
                                            value={login}
                                            onChange={handleLoginChange}
                                            mr={4}
                                            borderBottomWidth="2px"
                                            flex="1"
                                            focusBorderColor="accent.400"
                                        />
                                    ) : (
                                        <Text fontSize="md" textAlign="left" flex="1">
                                            {user?.login}
                                        </Text>
                                    )}
                                    {editMode === "login" ? (
                                        <Flex>
                                            <IconButton
                                                aria-label="Save Login"
                                                icon={<CheckIcon />}
                                                onClick={handleSubmit}
                                                colorScheme="teal"
                                                mr={2}
                                            />
                                            <IconButton
                                                aria-label="Cancel Edit"
                                                icon={<CloseIcon />}
                                                onClick={handleCancel}
                                                colorScheme="gray"
                                            />
                                        </Flex>
                                    ) : (
                                        <IconButton
                                            aria-label="Edit Login"
                                            icon={<EditIcon />}
                                            size="sm"
                                            onClick={() => setEditMode("login")}
                                        />
                                    )}
                                </Flex>
                            </FormControl>

                            {/* Email с подписью */}
                            <FormControl py={4} borderColor={borderColor} borderBottomWidth="2px">
                                <FormLabel fontWeight="bold" mb={2}>
                                    Email
                                </FormLabel>
                                <Text fontSize="md" textAlign="left">
                                    {user?.email}
                                </Text>
                            </FormControl>

                            {/* Кнопки "Удалить профиль" и "Выйти" */}
                            <Flex justify="space-between" mt={6}>
                                <Button
                                    bg={bgColor}
                                    color="red"
                                    onClick={handleDeleteProfile}
                                >
                                    Удалить профиль
                                </Button>
                                <IconButton
                                    bg={bgColor}
                                    aria-label="Выйти"
                                    icon={<FaSignOutAlt />} // Иконка выхода
                                    color="red"
                                    onClick={logout}
                                />
                            </Flex>
                        </>
                    )}
                </MotionBox>
            </AnimatePresence>
        </Flex>
    );
};

export default Profile;