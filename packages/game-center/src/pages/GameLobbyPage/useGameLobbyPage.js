import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchLobbyDetails } from "./api";
import { joinLobby } from "../MainScreen/MainScreenMiddleArea/LobbiesArea/api";
import { useLobbyContext } from "../../shared/context/LobbyContext/context";

export const useGameLobbyPage = () => {
  const { link } = useParams();
  const navigate = useNavigate();
  const { membersByLobby, setMembersByLobby } = useLobbyContext();
  const [lobbyDetails, setLobbyDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const userId = currentUser?.id;
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  const handleJoin = useCallback(async (password = "") => {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Authentication token not found.");
    }
    if (!link) {
      throw new Error("Lobby code (link) is missing.");
    }

    try {
      const joinResponse = await joinLobby(link, password);

      if (joinResponse) {
        const updatedLobbyResponse = await fetchLobbyDetails(link, token);

        if (updatedLobbyResponse.data.lobby) {
          const updatedLobby = updatedLobbyResponse.data.lobby;
          setLobbyDetails(updatedLobby); // State güncelleniyor

          setMembersByLobby(prev => ({
            ...prev,
            [updatedLobby.lobbyCode]: (updatedLobby.members || []).map(member => ({
              id: member.id,
              name: member.name,
              avatar: member.avatar,
              isHost: member.id === updatedLobby.createdBy,
              isReady: prev[updatedLobby.lobbyCode]?.find(m => m.id === member.id)?.isReady || false,
            }))
          }));

          setIsPasswordModalOpen(false); // Modal kapatılıyor
          return joinResponse;
        } else {
          throw new Error("Failed to fetch updated lobby details after joining.");
        }
      } else {
        throw new Error("Join request did not return a successful response.");
      }
    } catch (error) {
      console.error("Join error:", error);
      throw error; // Hata, LobbyPasswordModal tarafından yakalanacak
    }
  }, [link, setMembersByLobby]);


  useEffect(() => {
    let isMounted = true;
    const getLobbyDetails = async () => {
      setLoading(true);
      setError("");
      try {
        const token = localStorage.getItem("token");
        const response = await fetchLobbyDetails(link, token);

        if (isMounted && response.status === 200) {
          const lobby = response.data.lobby;
          lobby.members = lobby.members || [];
          setLobbyDetails(lobby);

          const userIsMember = lobby.members.some(
            (member) => String(member.id) === String(userId)
          );

          // Eğer kullanıcı üye değilse ve lobi şifreliyse VEYA şifresizse (yani her durumda) modalı göster
          if (!userIsMember) {
            setIsPasswordModalOpen(true);
          } else {
            // Kullanıcı zaten üye ise, context'i güncelle ve modalın kapalı olduğundan emin ol
            setMembersByLobby(prev => ({
              ...prev,
              [lobby.lobbyCode]: lobby.members.map(member => ({
                id: member.id,
                name: member.name,
                avatar: member.avatar,
                isHost: String(member.id) === String(lobby.createdBy),
                isReady: prev[lobby.lobbyCode]?.find(m => String(m.id) === String(member.id))?.isReady || false,
              }))
            }));
            setIsPasswordModalOpen(false);
          }
        } else if (isMounted) {
          setError(`Failed to fetch lobby details: Status ${response.status}`);
          if (response.status !== 401) navigate("/"); // Auth hatası değilse ana sayfaya yönlendir
        }
      } catch (error) {
        if (isMounted) {
          console.error("Error fetching lobby details:", error);
          if (error.response) {
            switch (error.response.status) {
              case 400:
                setError("Invalid request. Please check the lobby code.");
                break;
              case 404:
                setError(`Lobby with code "${link}" not found.`);
                navigate("/");
                break;
              case 401:
                setError("Authentication error. Please log in again.");
                // navigate("/login"); // veya login sayfanız
                break;
              default:
                setError(`An error occurred (${error.response.status}). Please try again later.`);
                break;
            }
          } else if (error.request) {
            setError("Unable to connect to the server. Please check your internet connection.");
          } else {
            setError("An error occurred: " + error.message);
          }
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    if (link && userId) {
      getLobbyDetails();
    } else if (!userId) {
      setError("User information not found. Please log in.");
      setLoading(false);
      navigate("/login"); // veya login sayfanız
    } else {
      setError("Lobby link parameter is missing.");
      setLoading(false);
      navigate("/");
    }

    return () => {
      isMounted = false;
    };
  }, [link, userId, setMembersByLobby, navigate]);

  // DÜZELTİLMİŞ KISIM:
  // Bu fonksiyon, LobbyPasswordModal'daki "Cancel" butonu, backdrop tıklaması
  // veya başarılı bir katılım sonrası çağrılır.
  // TEK GÖREVİ modalın görünürlük state'ini false yapmak olmalıdır.
  const handlePasswordModalClose = useCallback(() => {
    setIsPasswordModalOpen(false);
    // Buradan YÖNLENDİRME YAPILMAMALI.
    // GameLobbyPage component'i yeniden render olduğunda, güncel 'isMember'
    // durumuna göre AccessDeniedScreen'i gösterip göstermeyeceğine karar verecektir.
  }, [setIsPasswordModalOpen]); // Sadece setIsPasswordModalOpen'a bağımlı olmalı

  const members = useMemo(() => {
    // membersByLobby[link] öncelikli, yoksa lobbyDetails.members kullan
    const currentLobbyMembers = membersByLobby[link] || lobbyDetails?.members || [];
    return currentLobbyMembers.map(m => ({
        ...m,
        id: String(m.id), // ID'leri string olarak tutarlılık için
        isHost: String(m.id) === String(lobbyDetails?.createdBy)
    }));
  }, [membersByLobby, link, lobbyDetails]);

  const isMember = useMemo(() => {
    if (!lobbyDetails || !userId) return false;
    // Güncel 'members' listesini (yukarıdaki useMemo'dan gelen) kullan
    return members.some(member => String(member.id) === String(userId));
  }, [members, userId, lobbyDetails]); // lobbyDetails'a da bağlı olmalı


  return {
    lobbyDetails,
    loading,
    error,
    setError,
    members, // Bu, useMemo ile türetilen güncel members listesi
    userId: String(userId), // userId'yi string olarak döndür
    isPasswordModalOpen,
    setIsPasswordModalOpen, // Genellikle component dışından doğrudan çağrılmaz
    handleJoin,
    handlePasswordModalClose,
    isMember // Bu, GameLobbyPage'in kullanacağı güncel üyelik durumu
  };
};