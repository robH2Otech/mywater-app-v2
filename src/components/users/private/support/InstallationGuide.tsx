
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Download, Play, Info, Tool } from "lucide-react";

interface InstallationGuideProps {
  purifierModel: string;
}

export function InstallationGuide({ purifierModel }: InstallationGuideProps) {
  return (
    <div className="space-y-6">
      <div className="p-4 bg-spotify-darker rounded-lg">
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
          <Info className="h-5 w-5 text-mywater-blue mr-2" />
          Installation Guide for {purifierModel || "MYWATER System"}
        </h2>
        <Separator className="bg-spotify-accent my-4" />
        
        <div className="space-y-6">
          <Card className="bg-spotify-dark border-spotify-accent">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Tool className="h-5 w-5 text-mywater-blue mr-2" />
                Tools and Materials Needed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-5 text-gray-300 space-y-2">
                <li>Standard plumbing tools (wrench, pliers)</li>
                <li>Teflon tape for water connections</li>
                <li>Measuring tape</li>
                <li>Water line connector kit (included)</li>
                <li>Mounting screws (included)</li>
              </ul>
            </CardContent>
          </Card>
          
          <Card className="bg-spotify-dark border-spotify-accent">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Play className="h-5 w-5 text-mywater-blue mr-2" />
                Installation Videos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-spotify-darker p-4 rounded-md">
                <p className="font-medium text-white mb-2">Basic Setup Tutorial</p>
                <p className="text-gray-400 mb-2">Learn how to unpack and prepare your {purifierModel} for installation</p>
                <Button 
                  className="w-full bg-mywater-blue hover:bg-mywater-blue/90"
                  onClick={() => window.open("https://youtube.com/watch?v=example", "_blank")}
                >
                  <Play className="h-4 w-4 mr-2" />
                  Watch Video
                </Button>
              </div>
              
              <div className="bg-spotify-darker p-4 rounded-md">
                <p className="font-medium text-white mb-2">Complete Installation Guide</p>
                <p className="text-gray-400 mb-2">Step-by-step guide for installing your water purification system</p>
                <Button 
                  className="w-full bg-mywater-blue hover:bg-mywater-blue/90"
                  onClick={() => window.open("https://youtube.com/watch?v=example2", "_blank")}
                >
                  <Play className="h-4 w-4 mr-2" />
                  Watch Video
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-spotify-dark border-spotify-accent">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Download className="h-5 w-5 text-mywater-blue mr-2" />
                Documentation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                className="w-full bg-spotify-accent hover:bg-spotify-accent-hover"
                onClick={() => window.open("/installation-guides/mywater-installation.pdf", "_blank")}
              >
                <Download className="h-4 w-4 mr-2" />
                Download Installation Manual
              </Button>
              
              <Button 
                className="w-full bg-spotify-accent hover:bg-spotify-accent-hover"
                onClick={() => window.open("/installation-guides/mywater-maintenance.pdf", "_blank")}
              >
                <Download className="h-4 w-4 mr-2" />
                Download Maintenance Guide
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
