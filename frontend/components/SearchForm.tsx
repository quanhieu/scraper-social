"use client";

import { useCallback, useEffect, useState, useRef } from "react";
import { Controller, useForm } from "react-hook-form";
import { debounce } from "lodash";

import { getVideo } from "@/pages/api/analysisService";
import { getAnalysis } from "@/pages/api/analysisService";
import { AnalysisResponse } from "@/pages/api/interface";
import { VideoResponse } from "@/pages/api/interface";

type fetchVideosProps = {
  search: string;
  analysisId: string;
  password: string;
  sortBy: SortOptions;
  order: OrderOptions;
}

type SortOptions =
  | "viewCount"
  | "likeCount"
  | "commentCount"
  | "favoriteCount"
  | "averageInteraction";

type OrderOptions = "DESC" | "ASC";

export type SearchFormValues = {
  search: string;
  password: string;
  sortBy: SortOptions;
  order: OrderOptions;
};

const debouncedFetch = debounce((
  values: SearchFormValues, 
  callback: (values: SearchFormValues) => Promise<void>
) => {
  if (values.search && values.password) {
    callback(values);
  }
}, 1000);

type SearchFormProps = {
  videos: VideoResponse[];
  setVideos: (videos: VideoResponse[]) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  loadingVideos: boolean;
  setLoadingVideos: (loadingVideos: boolean) => void;
  delayMessage: string;
  setDelayMessage: (message: string) => void;
}

export default function SearchForm({
  setVideos,
  loading,
  setLoading,
  loadingVideos,
  setLoadingVideos,
  delayMessage,
  setDelayMessage
}: SearchFormProps) {
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const prevValuesRef = useRef<{
    search: string;
    sortBy: SortOptions;
    order: OrderOptions;
  }>({
    search: "",
    sortBy: "viewCount",
    order: "DESC"
  });
  const { control, watch, setValue, handleSubmit } = useForm<SearchFormValues>({
    defaultValues: {
      search: "",
      password: "",
      sortBy: "viewCount",
      order: "DESC",
    },
  });
  const [cacheQuery, setCacheQuery] = useState<fetchVideosProps>({
    search: "",
    analysisId: "",
    password: "",
    sortBy: "viewCount",
    order: "DESC",
  });

  useEffect(() => {
    const savedPassword = localStorage.getItem('searchPassword');
    if (savedPassword) {
      setValue('password', savedPassword);
    }
  }, [setValue]);

  const fetchVideos = useCallback(async (props: fetchVideosProps) => {
    setLoadingVideos(true);
    setDelayMessage("Videos will load in 5 seconds...");
    
    // Return a promise that resolves after 5 seconds
    return new Promise<void>((resolve) => {
      setTimeout(async () => {
        try {
          const {
            search,
            analysisId,
            password,
            sortBy,
            order
          } = props;
          
          setDelayMessage("Fetching videos...");
          const videoData = await getVideo(
            search,
            analysisId,
            password,
            {
              [sortBy]: order
            }
            // locale,
          );
          setVideos(videoData);
        } catch (error) {
          console.error("Error fetching videos:", error);
        } finally {
          setLoadingVideos(false);
          setDelayMessage("");
          resolve();
        }
      }, 5000); // 5 seconds delay
    });
  }, [setLoadingVideos, setVideos]);

  // auto fetch video again
  useEffect(() => {
    if (cacheQuery.search && cacheQuery.password) {
      fetchVideos(cacheQuery);
    }
  }, [cacheQuery, fetchVideos]);

  const fetchAnalysisAndVideos = useCallback(
    async (props: SearchFormValues) => {
    try {
      if (props.password) {
        localStorage.setItem('searchPassword', props.password);
      }
      
      setLoading(true);
      const analysisData = await getAnalysis(
        props.search,
        props.password
        // formValues.locale,
      );
      setAnalysis(analysisData);

      setCacheQuery({
        search: props.search,
        analysisId: analysisData._id,
        password: props.password,
        sortBy: props.sortBy,
        order: props.order
      });
      await fetchVideos({
        search: props.search,
        analysisId: analysisData._id,
        password: props.password,
        sortBy: props.sortBy,
        order: props.order
      });

    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const formValues = watch();
  useEffect(() => {
    const searchChanged = formValues.search !== prevValuesRef.current.search;
    const sortByChanged = formValues.sortBy !== prevValuesRef.current.sortBy;
    const orderChanged = formValues.order !== prevValuesRef.current.order;
    
    if (formValues.search && formValues.password && (searchChanged || sortByChanged || orderChanged)) {
      debouncedFetch(formValues, fetchAnalysisAndVideos);
      
      // Update the previous values
      prevValuesRef.current = {
        search: formValues.search,
        sortBy: formValues.sortBy,
        order: formValues.order
      };
    }
    
    return () => {
      debouncedFetch.cancel();
    };
  }, [formValues, fetchAnalysisAndVideos]);

  // Handle form submission
  const onSubmit = useCallback((data: SearchFormValues) => {
    if (data.search && data.password) {
      // Cancel any pending debounced calls
      debouncedFetch.cancel();
      
      // Call the fetch function immediately
      fetchAnalysisAndVideos(data);
      
      // Update the previous values
      prevValuesRef.current = {
        search: data.search,
        sortBy: data.sortBy,
        order: data.order
      };
    }
  }, [fetchAnalysisAndVideos]);

  return (
    <div className="bg-white p-6 pt-4 rounded-md shadow-md w-full max-w-4xl">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search Input */}
          <div className="mb-4">
            <label className="block text-gray-700">Search</label>
            <Controller
              name="search"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  type="text"
                  className="mt-1 w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter search term..."
                />
              )}
            />
          </div>

          {/* Password Input */}
          <div className="mb-4">
            <label className="block text-gray-700">Password</label>
            <Controller
              name="password"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  type="password"
                  className="mt-1 w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter password..."
                />
              )}
            />
          </div>

          {/* Sort By Selection */}
          {/* <div className="mb-4">
            <label className="block text-gray-700">Sort By</label>
            <Controller
              name="sortBy"
              control={control}
              render={({ field }) => (
                <select
                  {...field}
                  className="mt-1 w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="viewCount">View Count</option>
                  <option value="likeCount">Like Count</option>
                  <option value="commentCount">Comment Count</option>
                  <option value="favoriteCount">Favorite Count</option>
                  <option value="averageInteraction">Average Interaction</option>
                </select>
              )}
            />
          </div> */}

          {/* Order Selection */}
          {/* <div className="mb-4">
            <label className="block text-gray-700">Order</label>
            <Controller
              name="order"
              control={control}
              render={({ field }) => (
                <select
                  {...field}
                  className="mt-1 w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="DESC">Descending</option>
                  <option value="ASC">Ascending</option>
                </select>
              )}
            />
          </div> */}
        </div>

        {/* Submit Button */}
        <div className="mb-6">
          <button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            disabled={loading || loadingVideos}
          >
            {loading || loadingVideos ? 'Loading...' : 'Search'}
          </button>
        </div>
      </form>

      {/* Loading analysis */}
      {loading && <div className="text-center p-4">Loading analysis...</div>}
      {!loading && analysis && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-md mb-4">
          <div>
            <p className="font-medium">Input:</p>
            <p>{analysis.input}</p>
          </div>
          <div>
            <p className="font-medium">Product:</p>
            <p>{analysis.productName}</p>
          </div>
          <div>
            <p className="font-medium">Type:</p>
            <p>{analysis.inputType}</p>
          </div>
        </div>
      )}

      {/* Loading videos message */}
      {!loading && loadingVideos && (
        <div className="text-center p-4">
          <p className="text-lg font-semibold">{delayMessage}</p>
        </div>
      )}
    </div>
  );
}
