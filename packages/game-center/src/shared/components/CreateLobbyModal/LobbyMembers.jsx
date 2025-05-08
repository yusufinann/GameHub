import { Box, Typography, Paper, Avatar } from '@mui/material';

function LobbyMembers({ members,t }) {
  // Host üyeyi bul
  const hostMember = members.find(member => member.isHost);
  // Diğer üyeleri filtrele (host hariç)
  const otherMembers = members.filter(member => !member.isHost);

  return (
    <Paper
      elevation={4}
      sx={{
        p: 4,
        mb: 1,
        mx: 2,
        borderRadius: 3,
        background: 'rgb(165, 249, 190, 0.1)',
        border: '1px solid rgba(34,193,195,0.3)',
      }}
    >
      {/* Başlık */}
      <Typography
        variant="h6"
        sx={{
            mb: 1,
          color: 'rgba(34,193,195,1)',
          fontWeight: 600,
        }}
      >
        {t("Lobby Members")}
      </Typography>

      <Box
        sx={{
          background: 'white',
          py: 2,
          borderRadius: 2,
        }}
      >
        {hostMember && (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 1,
              p: 1,
              mb: 1, 
            }}
          >
            <Avatar
              src={hostMember.avatar}
              alt={hostMember.name}
              sx={{ width: 40, height: 40 }}
            />
            <Typography variant="body1" sx={{ color: 'rgba(34,193,195,1)' }}>
              {hostMember.name} ({t("Host")})
            </Typography>
          </Box>
        )}

        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 1,
            justifyContent: 'flex-start',
          }}
        >
          {otherMembers.length > 0 ? (
            otherMembers.map((member) => (
              <Box
                key={member.id}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 1,
                  p: 1,
                }}
              >
                <Avatar
                  src={member.avatar}
                  alt={member.name}
                  sx={{ width: 40, height: 40 }}
                />
                <Typography variant="body1" sx={{ color: 'rgba(34,193,195,1)' }}>
                  {member.name}
                </Typography>
              </Box>
            ))
          ) : (
            <Typography
              variant="body1"
              sx={{ color: 'rgba(34,193,195,1)', textAlign: 'center', width: '100%' }}
            >
              {t("noMembers")}
            </Typography>
          )}
        </Box>
      </Box>
    </Paper>
  );
}

export default LobbyMembers;