import { useEffect, useRef, useState } from "react";
import { Box, Download, RefreshCcw, Share2, X } from "lucide-react";
import { useNavigate, useOutletContext, useParams } from "react-router";
import {
  ReactCompareSlider,
  ReactCompareSliderImage,
} from "react-compare-slider";

import { generate3DView, modify3DView } from "../../lib/ai.action";
import Button from "../../components/ui/Button";
import ModifyPanel from "../../components/ModifyPanel";
import { createProject, getProjectById } from "../../lib/puter.action";

const VisualizerId = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userId } = useOutletContext<AuthContext>();

  const hasInitialGenerated = useRef(false);

  const [project, setProject] = useState<DesignItem | null>(null);
  const [isProjectLoading, setIsProjectLoading] = useState(true);

  const [isProcessing, setIsProcessing] = useState(false);
  const [isModifyOpen, setIsModifyOpen] = useState(false);
  const [modifyError, setModifyError] = useState<string | null>(null);
  const [currentImage, setCurrentImage] = useState<string | null>(null);

  const handleBack = () => navigate("/");
  const handleExport = () => {
    if (!currentImage) return;

    const link = document.createElement("a");
    link.href = currentImage;
    link.download = `roomify-${id || "design"}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const persistRender = async (item: DesignItem, renderedImage: string) => {
    const updatedItem = {
      ...item,
      renderedImage,
      renderedPath: undefined,
      timestamp: Date.now(),
      ownerId: item.ownerId ?? userId ?? null,
      isPublic: item.isPublic ?? false,
    };

    const saved = await createProject({
      item: updatedItem,
      visibility: "private",
    });

    if (saved) {
      setProject(saved);
      setCurrentImage(saved.renderedImage || renderedImage);
    }

    return saved;
  };

  const runGeneration = async (item: DesignItem) => {
    if (!id || !item.sourceImage) return;

    try {
      setIsProcessing(true);
      const result = await generate3DView({ sourceImage: item.sourceImage });

      if (result.renderedImage) {
        setCurrentImage(result.renderedImage);
        await persistRender(item, result.renderedImage);
      }
    } catch (error) {
      console.error("Generation failed: ", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleModify = async (instruction: string) => {
    if (!project?.sourceImage) return;

    try {
      setIsProcessing(true);
      setModifyError(null);
      setIsModifyOpen(false);

      const sourceForEdit = currentImage || project.sourceImage;
      const result = await modify3DView({
        sourceImage: sourceForEdit,
        instruction,
      });

      if (result.renderedImage) {
        setCurrentImage(result.renderedImage);
        await persistRender(project, result.renderedImage);
      }
    } catch (error) {
      console.error("Modify failed: ", error);
      setModifyError(
        error instanceof Error ? error.message : "Unable to apply the change.",
      );
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const loadProject = async () => {
      if (!id) {
        setIsProjectLoading(false);
        return;
      }

      setIsProjectLoading(true);

      const fetchedProject = await getProjectById({ id });

      if (!isMounted) return;

      setProject(fetchedProject);
      setCurrentImage(fetchedProject?.renderedImage || null);
      setIsProjectLoading(false);
      hasInitialGenerated.current = false;
    };

    loadProject();

    return () => {
      isMounted = false;
    };
  }, [id]);

  useEffect(() => {
    if (
      isProjectLoading ||
      hasInitialGenerated.current ||
      !project?.sourceImage
    )
      return;

    if (project.renderedImage) {
      setCurrentImage(project.renderedImage);
      hasInitialGenerated.current = true;
      return;
    }

    hasInitialGenerated.current = true;
    void runGeneration(project);
  }, [project, isProjectLoading]);

  return (
    <div className="visualizer">
      <nav className="topbar">
        <div className="brand">
          <Box className="logo" />

          <span className="name">Roomify</span>
        </div>
        <Button variant="ghost" size="sm" onClick={handleBack} className="exit">
          <X className="icon" /> Exit Editor
        </Button>
      </nav>

      <section className="content">
        <div className="panel">
          <div className="panel-header">
            <div className="panel-meta">
              <p>Project</p>
              <h2>{project?.name || `Residence ${id}`}</h2>
              <p className="note">Created by You</p>
            </div>

            <div className="panel-actions">
              <Button
                size="sm"
                onClick={() => setIsModifyOpen(true)}
                className="modify"
                disabled={!currentImage && !project?.sourceImage}
              >
                <RefreshCcw className="w-4 h-4 mr-2" /> Modify
              </Button>
              <Button
                size="sm"
                onClick={handleExport}
                className="export"
                disabled={!currentImage}
              >
                <Download className="w-4 h-4 mr-2" /> Export
              </Button>
              <Button size="sm" onClick={() => {}} className="share">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </div>

          <div className={`render-area ${isProcessing ? "is-processing" : ""}`}>
            {currentImage ? (
              <img src={currentImage} alt="AI Render" className="render-img" />
            ) : (
              <div className="render-placeholder">
                {project?.sourceImage && (
                  <img
                    src={project?.sourceImage}
                    alt="Original"
                    className="render-fallback"
                  />
                )}
              </div>
            )}

            {isProcessing && (
              <div className="render-overlay">
                <div className="rendering-card">
                  <RefreshCcw className="spinner" />
                  <span className="title">Working on your render</span>
                  <span className="subtitle">
                    {modifyError ? "Please try again." : "Generating or updating your 3D visualization"}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="panel compare">
          <div className="panel-header">
            <div className="panel-meta">
              <p>Comparison</p>
              <h3>Before and After</h3>
            </div>
            <div className="hint">Drag to compare</div>
          </div>

          <div className="compare-stage">
            {project?.sourceImage && currentImage ? (
              <ReactCompareSlider
                defaultValue={50}
                style={{ width: "100%", height: "auto" }}
                itemOne={
                  <ReactCompareSliderImage
                    src={project?.sourceImage}
                    alt="before"
                    className="compare-img"
                  />
                }
                itemTwo={
                  <ReactCompareSliderImage
                    src={currentImage || project?.renderedImage || ""}
                    alt="after"
                    className="compare-img"
                  />
                }
              />
            ) : (
              <div className="compare-fallback">
                {project?.sourceImage && (
                  <img
                    src={project.sourceImage}
                    alt="Before"
                    className="compare-img"
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {modifyError && (
        <div className="modify-error-banner">{modifyError}</div>
      )}

      <ModifyPanel
        isOpen={isModifyOpen}
        isProcessing={isProcessing}
        onClose={() => setIsModifyOpen(false)}
        onSubmit={handleModify}
      />
    </div>
  );
};
export default VisualizerId;
