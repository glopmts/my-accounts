import { NextRequest, NextResponse } from "next/server";
import { UTApi } from "uploadthing/server";

const utapi = new UTApi();

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "Nenhum arquivo enviado" },
        { status: 400 },
      );
    }

    // Validações
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "O arquivo deve ser uma imagem" },
        { status: 400 },
      );
    }

    if (file.size > 4 * 1024 * 1024) {
      return NextResponse.json(
        { error: "O arquivo deve ter no máximo 4MB" },
        { status: 400 },
      );
    }

    // Converter File para Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Criar um novo File com o buffer
    const uploadFile = new File([buffer], file.name, {
      type: file.type,
      lastModified: file.lastModified,
    });

    // Upload para UploadThing
    const response = await utapi.uploadFiles([uploadFile]);

    if (!response || !response[0]?.data?.url) {
      throw new Error("UploadThing não retornou URL");
    }

    return NextResponse.json({
      success: true,
      url: response[0].data.url,
      fileName: file.name,
      size: file.size,
      type: file.type,
    });
  } catch (error) {
    console.error("Erro no upload:", error);
    return NextResponse.json(
      {
        error: "Erro interno no servidor",
        details: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 },
    );
  }
}
