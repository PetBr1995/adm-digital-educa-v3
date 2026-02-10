import React from "react";
import { Box, LinearProgress, Typography, alpha } from "@mui/material";
import theme from "../../theme/theme";

const StatusProgressBar = ({ status, loading, uploadProgress, extraUploadProgress, extrasUploading, introUploading }) => {
  if (!status && !loading) return null;

  return (
    <Box sx={{ px: 2, pb: 2 }}>
      {status && (
        <Typography sx={{ mb: 1, color: "#fff", opacity: 0.9 }}>
          {status}
        </Typography>
      )}
      {loading && (
        <Box sx={{ display: "grid", gap: 1 }}>
          {introUploading && (
            <Box>
              <Typography variant="body2" sx={{ color: alpha("#fff", 0.85), mb: 0.5 }}>
                Vídeo introdutório
              </Typography>
              <LinearProgress
                variant={uploadProgress > 0 ? "determinate" : "indeterminate"}
                value={uploadProgress > 0 ? uploadProgress : undefined}
                sx={{
                  height: 8,
                  borderRadius: 2,
                  backgroundColor: alpha(theme.palette.primary.light, 0.15),
                  "& .MuiLinearProgress-bar": {
                    backgroundColor: theme.palette.primary.light,
                  },
                }}
              />
            </Box>
          )}

          {extrasUploading && (
            <Box>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                <Typography variant="body2" sx={{ color: alpha("#fff", 0.85) }}>
                  Vídeos livres / módulos
                </Typography>
                <Typography variant="body2" sx={{ color: alpha("#fff", 0.85) }}>
                  {Math.round(extraUploadProgress || 0)}%
                </Typography>
              </Box>
              <LinearProgress
                variant={extraUploadProgress > 0 ? "determinate" : "indeterminate"}
                value={extraUploadProgress > 0 ? extraUploadProgress : undefined}
                sx={{
                  height: 8,
                  borderRadius: 2,
                  backgroundColor: alpha("#FFFFFF", 0.08),
                  "& .MuiLinearProgress-bar": {
                    backgroundColor: alpha("#0BBE76", 0.9),
                  },
                }}
              />
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};

export default StatusProgressBar;
