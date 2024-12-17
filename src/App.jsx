import { Box, CircularProgress, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import Paper from "@mui/material/Paper";

const ZOHO = window.ZOHO;

function App() {
  const [initialized, setInitialized] = useState(false); // initialize the widget
  const [deals, setDeals] = useState(null);

  const [categoryBasedDeals, setCategoryBasedDeals] = useState(null);
  const [selectedCategories, setSelectedCategories] = useState([]);

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

        const dealFieldsResp = await ZOHO.CRM.META.getFields({
          Entity: "Deals",
        });
        const currentDealCategoreisRaw = dealFieldsResp?.fields?.filter(
          (field) => field?.api_name === "Lead_Category"
        )?.[0]?.pick_list_values;

        let categoryBasedDealsCount = {};
        currentDealCategoreisRaw?.forEach((category) => {
          categoryBasedDealsCount[category?.display_value] = 0;
        });
        currentDeals?.forEach((deal) => {
          let dealCategoryList = deal?.Lead_Category;
          dealCategoryList?.forEach((category) => {
            categoryBasedDealsCount = {
              ...categoryBasedDealsCount,
              [category]: categoryBasedDealsCount?.[category] + 1,
            };
          });
        });
        setCategoryBasedDeals(categoryBasedDealsCount);
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

  if (deals && categoryBasedDeals) {
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

          <Box sx={{ width: "100%", mb: 3 }}>
            <Box
              sx={{
                width: "100%",
                display: "flex",
                justifyContent: "start",
                alignItems: "center",
                flexDirection: "row",
                gap: 4,
                mb: 2,
              }}
            >
              <Typography
                sx={{
                  fontSize: "1.1rem",
                  fontWeight: "bold",
                }}
              >
                Category Counting
              </Typography>

              {selectedCategories?.length > 0 && (
                <Box
                  sx={{
                    border: "1px solid grey",
                    p: "2px 4px",
                    fontSize: "14px",
                    borderRadius: "10px",
                  }}
                  onClick={() => setSelectedCategories([])}
                >
                  <strong>X</strong> Clear Filters
                </Box>
              )}
            </Box>

            <Box
              sx={{
                width: "100%",
                display: "flex",
                justifyContent: "start",
                flexDirection: "row",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 2,
              }}
            >
              {Object.keys(categoryBasedDeals)?.map((category, index) => {
                return (
                  <Box
                    key={index}
                    sx={{
                      border: "1px solid lightgrey",
                      p: "4px 6px",
                      borderRadius: "10px",
                      "&:hover": {
                        cursor: "pointer",
                      },
                      fontSize: "14px",
                      bgcolor: selectedCategories?.includes(category)
                        ? "grey"
                        : "transparent",
                      color: selectedCategories?.includes(category)
                        ? "white"
                        : "black",
                    }}
                    onClick={() =>
                      setSelectedCategories((prev) => {
                        if (!prev.includes(category)) {
                          return [...prev, category];
                        }
                        return prev;
                      })
                    }
                  >
                    {category}{" "}
                    <span
                      style={{
                        fontWeight: "bold",
                        color: "white",
                        border: "1px solid #4682B4",
                        backgroundColor: "#4682B4",
                        padding: "0 5px",
                        borderRadius: "50%",
                      }}
                    >
                      {categoryBasedDeals?.[category]}
                    </span>
                  </Box>
                );
              })}
            </Box>
          </Box>

          {/* put the datagrid here */}
          <Paper sx={{ height: "67vh", width: "100%" }}>
            <DataGrid
              rows={deals?.filter((deal) => {
                if (selectedCategories?.length > 0) {
                  return deal?.Lead_Category?.some((category) =>
                    selectedCategories.includes(category)
                  );
                }
                return true; // If selectedCategories is empty, include all deals
              })}
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
