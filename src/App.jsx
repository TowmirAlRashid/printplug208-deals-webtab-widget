import { Box, CircularProgress, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import Paper from "@mui/material/Paper";

const ZOHO = window.ZOHO;

function App() {
  const [initialized, setInitialized] = useState(false); // initialize the widget
  const [deals, setDeals] = useState(null);

  useEffect(() => {
    // initialize the app
    ZOHO.embeddedApp.on("PageLoad", function (data) {
      setInitialized(true);
    });

    ZOHO.embeddedApp.init();
  }, []);

  useEffect(() => {
    if (initialized) {
      const fetchData = async () => {
        let func_name = "Fetch_deals_for_widget";
        var req_data = {
          arguments: JSON.stringify({}),
        };
        const functionResp = await ZOHO.CRM.FUNCTIONS.execute(
          func_name,
          req_data
        );
        const currentDeals = JSON.parse(functionResp?.details?.output).sort(
          (a, b) => new Date(a.Closing_Date) - new Date(b.Closing_Date)
        );
        setDeals(currentDeals);
      };

      fetchData();
    }
  }, [initialized]);

  const columns = [
    {
      field: "Deal_Name",
      headerName: "Deal Name",
      flex: 3,
      align: "left",
      renderCell: (params) => (
        <Box>
          <a
            href={`https://crm.zoho.com/crm/org774017204/tab/Potentials/${params.row.id}`} // adds the deal id from the current row data to the custom link
            style={{
              color: "#1976d2",
              textDecoration: "none",
            }}
            target="_blank"
            rel="noreferrer"
          >
            {params.value}
          </a>
        </Box>
      ),
    },
    { field: "Stage", headerName: "Stage", flex: 3, align: "left" },
    { field: "Lead_Category", headerName: "Category", flex: 2, align: "left" },
    {
      field: "Closing_Date",
      headerName: "Closing Date",
      flex: 1,
      align: "center",
    },
    { field: "Amount", headerName: "Amount", flex: 1, align: "center" },
  ];

  if (deals) {
    return (
      <Box
        sx={{
          width: "100%",
          height: "100%",
        }}
      >
        <Box
          sx={{
            width: "95%",
            mx: "auto",
            mt: 4,
          }}
        >
          <Typography
            sx={{
              textAlign: "center",
              fontSize: "1.4rem",
              fontWeight: "bold",
              mb: 3,
            }}
          >
            Open Deals
          </Typography>

          {/* put the datagrid here */}
          <Paper sx={{ height: "80vh", width: "100%" }}>
            <DataGrid
              rows={deals}
              columns={columns}
              pageSizeOptions={[5, 10]}
              sx={{ border: 0 }}
              rowHeight={42}
              disableRowSelectionOnClick
              density="standard"
              disableColumnMenu
              disableColumnSorting
            />
          </Paper>
        </Box>
      </Box>
    );
  } else {
    return (
      <Box
        sx={{
          width: "100%",
          height: "100%",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            gap: "1rem",
            margin: "20% 0",
          }}
        >
          <CircularProgress color="inherit" />
          <Typography fontWeight="bold" fontSize="1.5rem">
            Fetching Data. Please Wait...
          </Typography>
        </Box>
      </Box>
    );
  }
}

export default App;
